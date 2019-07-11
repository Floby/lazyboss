Design
======

Vocabulary
----------

### Job

A **Job** represent a task to be fulfilled. It is home to information such as:

  - the date it was created
  - the parameters needed for the task
  - the **Constraints** about who can fulfill the task

A **Job** may exist in one of these states at a time :

  + `pending`: The task need to be fulfilled but is awaiting a **Worker** to complete it
  + `assigned`: The **Worker** currently attempting to fulfill the job has been chosen
  + `processing`: The **Worker** has been reporting progress
  + `done`: The **Worker** has provided a success as an outcome
  + `failed`: The **Worker** has provided a failure as an outcome

### Worker

A **Worker** is an external process which has access to the API and can fulfill tasks. it has:

  - An identification
  - Credentials to prove its identification
  - **Abilities** which can satisfy the **Constraints** of a **Job**

### Vacancy

A **Vacancy** is what exists when a worker signals itself to be available to fulfill a **Job** It lifespan
is typically short-lived to a maximum of a few tens of seconds

### Attempt

When a **Vacancy** of a **Worker** whose **Abilities** satisfy and a pending **Job**'s **Constraints**, then
an **Attempt** at this **Job** is created. An **Attempt** is home to information such as:

  - The time it has started
  - progress on the completion of the task
  - The **Outcome** of this **Attempt**

### Outcome

The **Outcome** of an attempt can either be a success or a failure. Successes typically contain some sort
of result value. Failures typically contain a reason and an explanation. Some failure may lead to a **Retry**

### Retry

When an attempt has failed and the **Job** information allows it, the **Job** can become pending again.

Timelines
---------

### Worker ready and fulfills when job is created

worker:   ×---|        |-------O
vacancy:      ×-----×
job:              ×-|             O---
attempt:            ×--|       O--|

### Job ready when runner declares vacancy

worker:  ×---|    |--------O
vacancy:     ×-×
job:     ×-----|              O---
attempt:       ×--|        O--|
