select name, place, sName, sPlace from media join (
select name as sName, place as sPlace, visual as sVisual from (select * from media inner join mediaAssociate on name = audio)) where name = sVisual and owner = "test";
