export const string = (a: string) => a;

type Parser<T> = (s: string) => T;
class ContentNode<T> {
  constructor(public parser: Parser<T>) { }
}
export function content<T = string>(p: Parser<T> = string as any) {
  return new ContentNode<T>(p);
}

class AttributeNode<T> {
  constructor(public parser: Parser<T>) { }
}

export function attribute<T = string>(p: Parser<T> = string as any) {
  return new AttributeNode<T>(p);
}

export type Schema<T> = {
  [P in keyof T]: Schema<T[P]> | (T[P] extends object ? never : { parser: (v: string) => T[P] });
};

export type SchemaInternal = {
  [p: string]: SchemaInternal | { parser: (v: string) => any };
};

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

export function readXML<T>(xml: Element | Document, schema: Schema<T>, ns: NameResolver = ignoreNamespace): T {
  const json: any = {};
  const children = xml.children || /* IE */ (xml.childNodes as any as HTMLCollection);
  Object.keys(schema).forEach(k => {
    const s = (schema as SchemaInternal)[k];
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
      findMap(children, k, ns, e => v = readXML(e, s as SchemaInternal, ns));
    }
    if (v !== undefined) {
      json[k] = v;
    }
  });
  return json;
}
