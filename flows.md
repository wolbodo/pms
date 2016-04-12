# All database api calls, what should be checked/validated

* People:
  * `GET` (`/people`, `/person/:id`)
    * filter `fields` from `permissions:people:view`

  * `PUT` (`/person/:id`)
    * sending `gid` is required for put, when gid out of date, return `outdated` error.
    * validate `fields` from `permissions:people:edit`
      * Return specific errors when field also in `permissions:people:view`

  * `POST` (`/people`)
    * require `create` fields, which can only be edited on creation.

  * `DELETE` (`/person/:id`)
    * requires access to all `create` fields to be deleted. 

* Roles:
  * `GET` (`/roles`, `/roles/:id`)
    * filter `fields` from `permissions:roles:view`

  * `PUT` (`/roles/:id`)
    * validate `fields` from `permissions:roles:edit`
      * Return specific errors when field also in `permissions:roles:view`

  * `POST` (`/roles`)
    * require `create` fields, which can only be edited on creation.
    * after create trigger:
      * create permissions for `people_roles`::new_id for roles currently granting create role permission. 

  * `DELETE` (`/roles/:id`)
    * requires access to all `create` fields to be deleted. 
      * remove linked permissions

* Fields:
  * `GET` (`/fields`, `/fields/:id`)
    * filter `fields` from `permissions:fields:view`

  * `PUT` (`/fields/:id`)
    * validate `fields` from `permissions:fields:edit`
      * Return specific errors when field also in `permissions:fields:view`

  * `POST` (`/fields`)
    * require `create` fields, which can only be edited on creation.
      * after create:
        * create permissions for `field` and assign view/edit permissions to currently granting create field permission.

  * `DELETE` (`/fields/:id`)
    * requires access to all `create` fields to be deleted. 
      * remove linked permissions

* Links:
  * `PUT` (`/link/<table1>/<table2>`)