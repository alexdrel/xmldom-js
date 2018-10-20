import { content, string, readXML, attribute, prefixNamespace } from "../src/xmldom-js";


const rssString = `<?xml version='1.0' encoding='UTF-8'?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
  <channel>
	<link>http://example.com</link>
	<description>MRSS</description>
  <title>MRSS Title</title>

	<item>
		<title>Item 1</title>
		<media:title>Item 1</media:title>
		<media:content url="http://example.com/1.mp4" medium="video"/>
		<media:thumbnail url="http://example.com/1.jpg" height="360" width="640"/>
		<media:comment>Item 1 Comment</media:comment>
	</item>

  <item>
		<title>Item 2</title>
		<media:title>Item 2</media:title>
		<media:content url="http://example.com/2.mp4" medium="video"/>
		<media:thumbnail url="http://example.com/2.jpg" height="360" width="640"/>
		<media:comment>Item 2 Comment</media:comment>
	</item>

  <item>
		<title>Item 3</title>
		<media:title>Item 3</media:title>
		<media:content url="http://example.com/3.mp4" medium="video"/>
		<media:thumbnail url="http://example.com/3.jpg" height="360" width="640"/>
		<media:comment>Item 3 Comment</media:comment>
  </item>
  </channel>
</rss>
`;

const rssXml = new DOMParser().parseFromString(rssString, "text/xml");
const schema = {
  rss: {
    channel: {
      title: content(string),
      item: [{
        title: content(string),
        "media:content": { url: attribute() },
        "media:thumbnail": { url: attribute(string) },
        "media:nope": { url: attribute(string) },
        "media:comment": content(string)
      }]
    }
  }
};


describe("rss", () => {
  const rssJson = readXML(rssXml, schema, prefixNamespace);

  test("Check the document", () => {
    expect(rssJson.rss).toBeDefined();
    expect(rssJson.rss.channel).toBeDefined();
    expect(rssJson.rss.channel.item.length).toBeDefined();
  });
  test("Check the document shot", () => {
    expect(rssJson.rss.channel).toMatchSnapshot();
  });
  test("Check items", () => {
    expect(rssJson.rss.channel.item.length).toBe(3);
  });
});
