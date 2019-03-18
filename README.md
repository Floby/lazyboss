[![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

⚠ Work In Progress ⚠

Lazyboss
========

> A Job Scheduler which delegates to faceless workers

Lazyboss is a job server. It allows worker to connect to it and claim jobs to run.
Lazyboss doesn't do any actual work but only delegates to the workers it thinks
are best suited. It keeps track of what/when/to whom jobs are delegated and interveines if they
take too long. If you're lazyboss's supervisor, you can dictate how it treats its workers.
You'd think lazyboss would at least do some reporting and monitoring, but no. Instead, lazyboss is very
happy to make data available for other to monitor and report.

It relies heavily on HTTP long polling and `content-type: event-stream`

Install
-------

    $ npm install -g lazyboss

Run
---

    $ DATABASE_URL=<your db> lazyboss

Usage
-----

### Create a job

```
> POST /jobs
> Content-Type: application/json
>
> { type, parameters, ... }

< 202 Accepted
< Location: /jobs/{jobId}
<
< { id=jobId, status=pending, type, parameters }
```

### Get job status

```
> GET /jobs/{jobId}

< 200 OK
<
< { id, type, status, parameters, result, error }
```

### Follow a job status

```
> GET /jobs/{jobId}
> Accept: text/event-stream

< 200 OK
< Content-Type: text/event-stream
<
< data: { id, status, parameters, result, error }
< 
< data: { id, status, parameters, result, error }
< ...
```

### Ask for a job to do

```
> POST /jobs/attempt
> Authorization: Credentials<worker>
 
< 201 Created
< Content-Type: application/json
< Location: /jobs/{jobId}/attempts/{attemptId}
<
< { id, status=processing, startedAt, parameters, assignee: worker.id, attempt: attemptId }
```

### Complete a job

```
> PUT /jobs/{jobId}/attempts/{attemptId}/result
> Authorization: Credentials<worker.id>
> Content-Type: application/json
>
> { ... }

< 201 Created
```

### Fail a job

```
> PUT /jobs/{jobId}/attempts/{attemptId}/error
> Authorization: Credentials<worker.id>
> Content-Type: application/json
>
> { ... }

< 201 Created
```

### Show progress

```
> PUT /jobs/{jobsId}/attempts/{attemptId}/progress
> Authorization: Credentials<worker.id>
> Content-Type: text/event-stream
> Last-Event-Id: 0
>
> id: 1
> event: log_chunk
> data: <chunk>
>
> id: 2
> event: percent
> data: 33
>
> ...

< 202 Accepted
< Content-Type: text/event-stream
< Last-Event-Id: 0
< 
< id: 1
< event: seen
< data: seen
< 
< id: 2
< event: seen
< data: seen
```

Test
----

    npm test


Contributing
------------

Anyone is welcome to submit issues and pull requests


License
-------

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[travis-image]: http://img.shields.io/travis/Floby/lazyboss/master.svg?style=flat
[travis-url]: https://travis-ci.org/Floby/lazyboss
[coveralls-image]: http://img.shields.io/coveralls/Floby/lazyboss/master.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Floby/lazyboss

