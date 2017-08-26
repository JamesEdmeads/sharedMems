insert into person(uname, pword, owner) values ('owner', 'o', 1);
insert into person(uname, pword, owner) values ('con', 'c', 0);
insert into person(uname, pword, owner) values ('me', 'mp', 1);

insert into personAssociate(owner, associate) values ('owner', 'con');

insert into media(name, place, creator, owner) values ('owner/pic1.jpg','./files/owner/pic1.jpg', 'con', 'owner');
insert into media(name, place, creator, owner) values ('owner/pic2.jpg', './files/owner/pic2.jpg', 'con', 'owner');
insert into media(name, place, creator, owner) values ('owner/song1.mp3', './files/owner/song1.mp3', 'con', 'owner');
insert into media(name, place, creator, owner) values ('owner/song2.mp3', './files/owner/song2.mp3', 'con', 'owner');
insert into media(name, place, creator, owner) values ('me/annupurna.jpg', './files/me/annupurna.jpg', 'me', 'me');
insert into media(name, place, creator, owner) values ('me/climbing.jpg', './files/me/climbing.jpg', 'me', 'me');
insert into media(name, place, creator, owner) values ('me/coldfeet.jpg', './files/me/coldfeet.jpg', 'me', 'me');
insert into media(name, place, creator, owner) values ('me/gokyo.jpg', './files/me/gokyo.jpg', 'me', 'me');
insert into media(name, place, creator, owner) values ('me/honeymoon.jpg', './files/me/honeymoon.jpg', 'me', 'me');
insert into media(name, place, creator, owner) values ('me/dust.mp3', './files/me/dust.mp3', 'me', 'me');
insert into media(name, place, creator, owner) values ('me/riverman.mp3', './files/me/riverman.mp3', 'me', 'me');

insert into mediaAssociate(visual, audio) values ('owner/pic1.jpg', 'owner/song1.mp3');
insert into mediaAssociate(visual, audio) values ('owner/pic1.jpg', 'owner/song2.mp3');
insert into mediaAssociate(visual, audio) values ('owner/pic2.jpg', 'owner/song1.mp3');
insert into mediaAssociate(visual, audio) values ('me/coldfeet.jpg', 'me/riverman.mp3');
insert into mediaAssociate(visual, audio) values ('me/gokyo.jpg', 'me/dust.mp3');
