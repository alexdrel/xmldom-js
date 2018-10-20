import { content, string, readXML, attribute, ignoreNamespace, prefixNamespace, namespaces } from "../src/xmldom-js";

const xmlString = `<?xml version='1.0' encoding='UTF-8'?>
    <root xmlns="//ns1" xmlns:ns3="//ns3">
      <empty/>
      <ns2:items xmlns:ns2="//ns2">
        <item id="2" ns2:val="3">
          <ns2:name>Item Name</ns2:name>
        </item>
      </ns2:items>
      <name ns3:a="1">Name</name>
    </root>`;

const xml = new DOMParser().parseFromString(xmlString, "text/xml");

describe("local namespaced xml", () => {
  const json = readXML(xml,
    {
      root: {
        name: {
          "": content(string),
          "ns3:a": attribute(),
          na: attribute()
        },
        empty: content(),
        missing: content(),
        "ns2:items": {
          item: [{
            "ns2:name": content(string),
            "ns2:val": attribute(x => +x),
            id: attribute(x => +x),
            na: attribute()
          }]
        }
      }
    },
    prefixNamespace,
  );

  test("Check the document", () => {
    expect(json.root).toBeDefined();
    expect(json.root.name).toEqual({ "": "Name", "ns3:a": "1" });
    expect(json.root.empty).toBe("");
    expect(json.root.missing).toBe(undefined);
  });

  test("Check the document shot", () => {
    expect(json.root).toMatchSnapshot();
  });
  test("Check items", () => {
    expect(json.root["ns2:items"].item.length).toBe(1);
    const i = json.root["ns2:items"].item[0];
    expect(i).toEqual({ id: 2, "ns2:name": "Item Name", "ns2:val": 3 });

  });
});

describe("ignored namespaced xml", () => {
  const json = readXML(xml,
    {
      root: {
        name: {
          "": content(string),
          a: attribute(),
          na: attribute()
        },
        empty: content(),
        missing: content(),
        items: {
          item: [{
            name: content(string),
            id: attribute(x => +x),
            val: attribute(x => +x),
          }]
        }
      }
    },
    ignoreNamespace
  );

  test("Check the document shot", () => {
    expect(json.root).toMatchSnapshot();
  });
  test("Check items", () => {
    expect(json.root.items.item.length).toBe(1);
    const i = json.root.items.item[0];
    expect(i).toEqual({ id: 2, name: "Item Name", val: 3 });
  });
});

describe("real namespaced xml", () => {
  const json = readXML(xml,
    {
      root: {
        name: {
          "": content(string),
          "ns3:a": attribute(),
          na: attribute()
        },
        empty: content(),
        missing: content(),
        "m:items": {
          item: [{
            "m:name": content(string),
            id: attribute(x => +x),
            "m:val": attribute(x => +x),
            na: attribute()
          }]
        }
      }
    },
    namespaces("//ns1", {
      m: "//ns2",
      ns3: "//ns3",
    }),
  );

  test("Check the document", () => {
    expect(json.root).toBeDefined();
    expect(json.root.name).toEqual({ "": "Name", "ns3:a": "1" });
    expect(json.root.empty).toBe("");
    expect(json.root.missing).toBe(undefined);
  });

  test("Check the document shot", () => {
    expect(json.root).toMatchSnapshot();
  });
  test("Check items", () => {
    expect(json.root["m:items"]).toBeDefined();
    expect(json.root["m:items"].item.length).toBe(1);
    const i = json.root["m:items"].item[0];
    expect(i).toEqual({ id: 2, "m:name": "Item Name", "m:val": 3 });
    expect(i["m:name"]).toBeDefined();
    expect(i.id).toBe(2);
    expect(i.na).toBe(undefined);
  });
});
