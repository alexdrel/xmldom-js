import { content, string, readXML, attribute, Schema } from "../src/xmldom-js";

const domParser = new DOMParser();

function xml2json<T>(xmlString: string, schema: Schema<T>) {
  return readXML(domParser.parseFromString(xmlString, "text/xml"), schema) as T;
}

interface Data {
  root: {
    name: {
      [""]: string,
      a: string,
      na: string
    },

    empty: string,
    empty1: string,
    missing: string,
    item: {
      name: string,
      id: number
      na: string,
    }[];
  }
}

const schema = {
  root: {
    name: { "": content(string), a: attribute(), na: attribute() },

    empty: content(),
    empty1: content(),
    missing: content(),
    item: [{
      name: content(string),
      id: attribute(x => +x),
      na: attribute(),
    }]
  }
};

describe("basic xml", () => {
  const json = xml2json<Data>(
    `<?xml version='1.0' encoding='UTF-8'?>
    <root>
      <empty/>
      <empty1><x/></empty1>

      <item id="2">
        <name>Item Name</name>
      </item>

      <name a="1">Name</name>
    </root>`,
    schema
  );

  test("Check the document", () => {
    expect(json.root).toBeDefined();
    expect(json.root.name).toEqual({ "": 'Name', a: '1' });
    expect(json.root.empty).toBe("");
    expect(json.root.empty1).toBe("");
    expect(json.root.missing).toBe(undefined);
  });

  test("Check the document shot", () => {
    expect(json.root).toMatchSnapshot();
  });
  test("Check items", () => {
    expect(json.root.item.length).toBe(1);
    const i = json.root.item[0];
    expect(i.name).toBeDefined();
    expect(i.id).toBe(2);
    expect(i.na).toBe(undefined);
  });
});
