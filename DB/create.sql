DROP TABLE IF EXISTS mediaAssociate;
DROP TABLE IF EXISTS personAssociate;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS person;

CREATE TABLE person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uname varchar(50) NOT NULL,
  pword varchar(50) NOT NULL,
  owner INTEGER NOT NULL
);

CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name varchar(50) NOT NULL,
  place varchar(50) NOT NULL,
  creator varchar(50) NOT NULL,
  owner varchar(50) NOT NULL,
  FOREIGN KEY (creator) REFERENCES person(uname),
  FOREIGN KEY (owner) REFERENCES person(uname)
);

CREATE TABLE personAssociate (
  owner varchar(50) NOT NULL,
  associate varchar(50) NOT NULL,
  FOREIGN KEY (owner) REFERENCES person(uname),
  FOREIGN KEY (associate) REFERENCES person(uname),
  PRIMARY KEY (owner, associate)
);

CREATE TABLE mediaAssociate  (
  visual INTEGER NOT NULL,
  audio INTEGER NOT NULL,
  FOREIGN KEY (visual) REFERENCES media(id),
  FOREIGN KEY (audio) REFERENCES media(id),
  PRIMARY KEY (visual, audio)
);




