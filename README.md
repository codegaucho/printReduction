Print Reduction Pledge

=========


The PrintReductionPledge is an ASP.NET MVC5 C# application with MongoDB as the database, written by Tom Murphy (tom@codegaucho.com).  It is used to track our paper reduction progress through data collected in PaperCut.  In addition, it asks all of our users to take a pledge, and tracks their success (or lack of) in meeting their goals.


* [Twitter Bootstrap] - keeps everything similar and simple
* [dojo] - I like their AMD implementation, and defining classes
* [jQuery] - while I prefer dojo's syntax, Bootstrap needs jQuery, and there are an occasional thing that is easier with jQuery over dojo
* [MongoRepository] - to provide the MongoDB driver and a repository pattern
* [RabbitMQ Client] - to allow us to log to RabbitMQ
* [Dillinger] - used to create this markdown document



Usage

----

modify the Web.config and add in the connection string for your mongo db



```sh

<add name="MongoServerSettings" connectionString="mongodb://user:password@server/database" />



``` 

License

----


MIT


[tom murphy]:http://codegaucho.com
[Twitter Bootstrap]:http://twitter.github.com/bootstrap/
[dojo]:http://dojotoolkit.org
[jQuery]:http://jquery.com
[Dillinger]:http://dillinger.io
[MongoRepository]:http://mongorepository.codeplex.com/
[RabbitMQ Client]:http://www.rabbitmq.com/dotnet.html

