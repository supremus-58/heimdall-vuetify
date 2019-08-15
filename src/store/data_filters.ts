import { Module, VuexModule, getModule } from "vuex-module-decorators";
import DataModule, {
  ContextualizedProfile,
  ContextualizedControl,
  ContextualizedExecution
} from "./data_store";
import {
  ControlStatus,
  Severity,
  hdfWrapControl as hdf,
  HDFControl,
  AnyFullControl
} from "inspecjs";
import { FileID, isInspecFile } from "./report_intake";
import Store from "./store";

/** Contains common filters on data from the store. */
export interface Filter {
  // General
  /** Which file these objects came from. Undefined => any */
  fromFile?: FileID;

  // Control specific
  /** What status the controls can have. Undefined => any */
  status?: ControlStatus;

  /** What severity the controls can have. Undefined => any */
  severity?: Severity;

  /** Whether or not to allow/include overlayed controls */
  omit_overlayed_controls?: boolean;

  /** A search term string, case insensitive
   * We look for this in
   * - control ID
   * - rule title
   * - severity
   * - status
   * - finding details (from HDF)
   * - code
   */
  search_term?: string;
  // Add more as necessary
}

/**
 * Facillitates the search functionality
 * @param term The string to search with
 * @param context_control The control to search for term in
 */
function contains_term(
  context_control: ContextualizedControl,
  term: string
): boolean {
  let control = context_control.data;
  let as_hdf = hdf(control);
  // Get our (non-null) searchable data
  let searchables: string[] = [
    control.id,
    control.title,
    control.code,
    as_hdf.severity,
    as_hdf.status,
    as_hdf.finding_details
  ].filter(s => s !== null) as string[];

  // See if any contain term
  return searchables.some(s => s.toLowerCase().includes(term));
}

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: "filteredData"
})
class FilteredDataModule extends VuexModule {
  private get dataStore(): DataModule {
    return getModule(DataModule, Store);
  }

  /**
   * Parameterized getter.
   * Get all profiles from the specified file id.
   */
  get profiles(): (filter: Filter) => ContextualizedProfile[] {
    // const localCache: {[key: string]: Control[]} = {};
    // Establish to vue that we depend on this.contextStore
    // let _depends: any = this.contextStore;
    return (filter: Filter = {}) => {
      // If there is no filter, just return all
      if (filter.fromFile === undefined) {
        return this.dataStore.contextualProfiles;
      }

      // Initialize our list to add valid profiles to
      let profiles: ContextualizedProfile[] = [];

      // Filter to those that match our filter. In this case that just means come from the right file id
      this.dataStore.contextualProfiles.forEach(prof => {
        if (isInspecFile(prof.sourced_from)) {
          if (prof.sourced_from.unique_id === filter.fromFile) {
            profiles.push(prof);
          }
        } else {
          // Its a report; go two levels up to get its file
          if (prof.sourced_from.sourced_from.unique_id === filter.fromFile) {
            profiles.push(prof);
          }
        }
      });

      return profiles;
    };
  }

  /**
   * Parameterized getter.
   * Get all controls from all profiles from the specified file id.
   */
  get controls(): (filter: Filter) => ContextualizedControl[] {
    const localCache: { [key: string]: ContextualizedControl[] } = {};
    // Establish to vue that we depend on this.contextStore
    let _depends: any = this.dataStore.contextStore;
    return (filter: Filter = {}) => {
      // Generate a hash for cache purposes.
      // If the "search_term" string is not null, we don't cache - no need to pollute
      let id: string | null = null;
      if (filter.search_term !== null) {
        id = JSON.stringify(filter);
      }

      // Check if we have this cached:
      if (id !== null && id in localCache) {
        return [...localCache[id]];
      }

      // First get all of the profiles using the same filter
      let controls = this.profiles(filter).flatMap(profile => profile.contains);

      // Filter by status, if necessary
      if (filter.status !== undefined) {
        controls = controls.filter(
          control => hdf(control.data).status === filter.status
        );
      }

      // Filter by severity, if necessary
      if (filter.severity !== undefined) {
        controls = controls.filter(
          control => hdf(control.data).severity === filter.severity
        );
      }

      // Filter by overlay
      if (filter.omit_overlayed_controls) {
        controls = controls.filter(control => control.extended_by.length === 0);
      }

      // Filter by search term
      if (filter.search_term !== undefined) {
        let term = filter.search_term.toLowerCase();

        // Filter controls to those that contain search term
        controls = controls.filter(c => contains_term(c, term));
      }

      // Save to cache
      if (id !== null) {
        localCache[id] = controls;
      }
      return [...controls]; // Return a shallow copy
    };
  }
}

export default FilteredDataModule;
