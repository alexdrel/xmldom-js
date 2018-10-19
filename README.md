[![Build Status](https://travis-ci.org/alexdrel/xmldom-js.svg?branch=master)](https://travis-ci.org/alexdrel/xmldom-js)

xmldom-js
===
Lightweight schema-based XML data extraction to plain objects (JSON)

### Example

To read the data from the following XML

```xml
<?xml version='1.0' encoding='UTF-8'?>
  <rss xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
    <channel>
      <title>MRSS Title</title>

      <item>
        <title>Item 1</title>
        <media:content url="http://example.com/1.mp4" medium="video"/>
        <media:comment>Item 1 Comment</media:comment>
      </item>

      <item>
        <title>Item 2</title>
        <media:content url="http://example.com/2.mp4" medium="video"/>
        <media:comment>Item 2 Comment</media:comment>
      </item>

    </channel>
  </rss>
```

Data extraction schema:
 
 ```js 
import { array, attribute, content, string, readXML, prefixNamespace } from "xmldom-js";

var rssSchema = {
  rss: {
    channel: {
      title: content(string),
      item: array({
        title: content(string),
        "media:content": { url: attribute() },
        "media:comment": content(string)
      })
    }
  }
};
```

First xml is parsed using the browser DOMParser and then read into plain JS objects using the schema:

```js
  var rssXml = new DOMParser().parseFromString(rssString, "text/xml");

  var rssJSON = readXML(rssXml, rssSchema, prefixNamespace);
```

The resulting JSON:

```json
{
  "rss": {
    "channel": {
      "title": "MRSS Title",
      "item": [
        {
          "title": "Item 1",
          "media:content": {
            "url": "http://example.com/1.mp4"
          },
          "media:comment": "Item 1 Comment"
        },
        {
          "title": "Item 2",
          "media:content": {
            "url": "http://example.com/2.mp4"
          },
          "media:comment": "Item 2 Comment"
        }
      ]
    }
  }
}
```

### Namespace handling
A few modes for handling of the namespace are available:
* _ignoreNamespace_ - namespace and prefixes are ignored
* _prefixNamespace_ - use namespace prefixes as is ignoring namespaceURI. Should not be used if XML is provided by third-party as prefixes are not supposed to be stable, but quite safe for in-house XMLs.
* _namespaces(defaultURI, { prefix: URI })_ - provide map of supported namespace with URIs.



## Usage
Npm compatible packager (webpack) is required. CommonJS and ES6 modules are provided, transpiled to es5.

