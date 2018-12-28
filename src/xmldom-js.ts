export const string = (a: string) => a;

type Parser = (s: string) => any;
class ContentNode {
  constructor(public parser: Parser) { }
}
export function content(p: Parser = string) {
  return new ContentNode(p);
}
class AttributeNode {
  constructor(public parser: Parser) { }
}
export function attribute(p: Parser = string) {
  return new AttributeNode(p);
}

export type NameResolver = (jn: string, e: Element | Attr) => boolean;

export const ignoreNamespace: NameResolver = (jn, e) => e.localName == jn;

export const prefixNamespace: NameResolver = (jn, e) => e.nodeName == jn;

export function namespaces(def: string, nsmap: { [prefix: string]: string }): NameResolver {
  return (jn, e) => {
    let [p, n] = jn.split(":");
    if (n == undefined) {
      return e.localName == jn && e.namespaceURI == (e.nodeType !== e.ATTRIBUTE_NODE ? def : null);
    }
    return e.localName == n && e.namespaceURI == nsmap[p];
  }
}

function findMap<T extends Element | Attr>(list: ArrayLike<T>, name: string, ns: NameResolver, func: (e: T) => void, once = true) {
  for (let i = 0; i < list.length; i++) {
    if (ns(name, list[i])) {
      func(list[i]);
      if (once) {
        return;
      }
    }
  }
}

export function readXML(xml: Element | Document, schema: any, ns: NameResolver = ignoreNamespace): any {
  const json: any = {};
  const children = xml.children || /* IE */ (xml.childNodes as any as HTMLCollection);
  Object.keys(schema).forEach(k => {
    const s = schema[k];
    let v: any;
    if (s instanceof ContentNode) {
      if (k === "") {
        v = s.parser(xml.textContent as string);
      } else {
        findMap(children, k, ns, e => v = s.parser(e.textContent as string));
      }
    } else if (s instanceof AttributeNode && xml instanceof Element) {
      findMap(xml.attributes, k, ns, e => v = s.parser(e.textContent as string));
    } else if (Array.isArray(s)) {
      v = [];
      findMap(children, k, ns, e => v.push(readXML(e, s[0], ns)), false);
    } else /* Structured element */ {
      findMap(children, k, ns, e => v = readXML(e, s, ns));
    }
    if (v !== undefined) {
      json[k] = v;
    }
  });
  return json;
}
