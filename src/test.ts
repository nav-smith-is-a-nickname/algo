import { Obj, Content, ContentList } from ".";

// little test
var user = new Obj(true, 10);
var content = new Content(true, 10);
var content2 = new Content(true, 10);
var contentlist = new ContentList();
contentlist.content_getter = [content, content2];
var recommendations = contentlist.recommend(user, 1.5);
console.log(recommendations);
