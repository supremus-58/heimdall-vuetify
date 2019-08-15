import {
  HDFControl,
  NistHash,
  generateNewNistHash,
  NistFamily,
  NistCategory
} from "inspecjs";

// The type accepted by d3
interface TreemapNode {
  name: string;
  value?: number;
  children: TreemapNode[];
}

/**
 * Utility for categorizing controls by nist hash, using current data store
 */
// Treemap requires all nodes to have a children function and a name
export function populateNistHash(controls: HDFControl[]): NistHash {
  // Create an empty hash
  let nistHash: NistHash = generateNewNistHash();

  // Add each control to the hash where appropriate
  controls.forEach(control => {
    control.nist_tags.forEach(tag => {
      // Split the tag into its corresponding parts
      let tag_family = tag.substr(0, 2);
      let tag_category = tag.substr(4);

      // Get the family (if it exists)
      let nist_family = nistHash.children.find(
        family => family.name === tag_family
      );
      if (nist_family === undefined) {
        console.warn(`Undefined nist family ${tag_family} in tag ${tag}`);
        return;
      }

      // Get the category (if it exists)
      let nist_category = nist_family.children.find(
        category => category.name === tag_category
      );
      if (nist_category === undefined) {
        console.warn(`Undefined nist category ${tag_category} in tag ${tag}`);
        return;
      }

      // Add the control to the category
      nist_category.children.push(control);
    });
  });

  // Job's done
  return nistHash;
}
type NistHashLevel = NistHash | NistFamily | NistCategory;
/**
 * This class acts as a treemap node and automagically generated children based on which of its properties is filled
 */
class HashWrapper implements TreemapNode {
  // This is at most one of these types
  content: NistHashLevel | HDFControl;

  constructor(content: NistHashLevel | HDFControl) {
    this.content = content;
  }

  get children(): HashWrapper[] {
    if ((this.content as HDFControl).wraps === undefined) {
      // It must be a nist hash layer - controls define wraps
      let nhl_content = this.content as NistHashLevel;
      let children: Array<NistFamily | NistCategory | HDFControl> =
        nhl_content.children;
      return children.map(element => new HashWrapper(element));
    } else {
      return [];
    }
  }

  get name(): string {
    if ((this.content as HDFControl).wraps === undefined) {
      // It must be a nist hash layer - controls define wraps
      let nhl_content = this.content as NistHashLevel;
      return nhl_content.name;
    } else {
      let c_content = this.content as HDFControl;
      return c_content.wraps.id;
    }
  }
}

export function nistHashToTreeMap(hash: NistHash): TreemapNode {
  return new HashWrapper(hash);
}
