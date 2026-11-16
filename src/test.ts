import { Obj, Content, ContentList } from "./index.js";

// little test
var user = new Obj(10, true);
var content = new Content(10, true);
var content2 = new Content(10, true);
var contentlist = new ContentList([content, content2]);
var recommendations = contentlist.recommend(user, 1.5, 0, Infinity);
console.log(recommendations);
console.log(recommendations[0].content.sureness);
console.log(recommendations[0].user.definition.array);
console.log(contentlist.content_getter);