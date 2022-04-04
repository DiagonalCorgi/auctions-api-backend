# SENG365 2022 Assignment 1 API server

# Overview of how to work on the assignment
1. You hackity hack...
2. You test with Postman
3. You commit your changes to your git repo on `eng-git.canterbury.ac.nz`.

Remember that we will test your application by downloading it directly from the `master` branch  on eng-git.
So ensure that you have committed everything to your repo before the deadline.
It may also pay to check that you can download and run your application with the following steps

1. Download repo
2. run `npm install`
3. create a `.env` file
4. run `npm run start`

## Running locally

1. Use `npm install` to populate the `node_modules/` directory with up-to-date packages
2. Create a file called `.env`, following the instructions in the section below
3. Go to https://dbadmin.csse.canterbury.ac.nz and create a database with the name that you set in the `.env` file
2. Run `npm run start` or `npm run debug` to start the server
3. The server will be accessible on `localhost:4941`

### `.env` file
Create a `.env` file in the root directory of this project including the following information (note that you will need to create the database first in phpMyAdmin):

```
SENG365_MYSQL_HOST=db2.csse.canterbury.ac.nz
SENG365_MYSQL_USER={your usercode}
SENG365_MYSQL_PASSWORD={your password}
SENG365_MYSQL_DATABASE={a database starting with your usercode then an underscore}
```

For example:
```
SENG365_MYSQL_HOST=db2.csse.canterbury.ac.nz
SENG365_MYSQL_USER=abc123
SENG365_MYSQL_PASSWORD=password
SENG365_MYSQL_DATABASE=abc123_s365
```

## Testing

There is a Postman collection provided to you and can be run as a 'collection' to test your application. These are a subset of the full set of tests that will be used to mark your assignment. (Note that a different set of data will be used for marking.)

For more information regarding the Postman suite refer to README.md file in the /app/resources/postman folder

## Storing photos

You should set up your application to store files in the `storage/photos` directory; this is where the photos used for the sample data are copied into when you run a `/resample` or `/reload` request. There will initially be a file called `.gitkeep` in there; this is just so that the directory gets included in the git repository (see https://stackoverflow.com/q/7229885/8355496 for more information).

## Setting up a database connection in WebStorm

To enable autocomplete for database tables, columns, etc., you can connect WebStorm to the `db2` database by following the instructions at https://www.jetbrains.com/help/idea/connecting-to-a-database.html#connect-to-mysql-database. The details to enter are:

* Host: `db2.csse.canterbury.ac.nz`
* Port: `3306`
* User: (your usercode)
* Password: (your password)
* Database: (your database, as in `.env`)


## Some notes about endpoint status codes
The api spec provides several status codes that each endpoint can return. Apart from the 500 'Internal Server Error'
each of these represents a flow that may be tested. Hopefully from the labs you have seen these status codes before and 
have an understanding of what each represents. A brief overview is provided in the table below. 

| Status Code | Status Message | Description                                    | Example                                          |
|:------------|----------------|------------------------------------------------|--------------------------------------------------|
| 200         | OK             | Request completed successfully                 | Successfully get auctions                        |
| 201         | Created        | Resources created successfully                 | Successfully create auction                      |
| 400         | Bad Request    | The request failed due to client error         | Creating an auction without a request body       |
| 401         | Unauthorised   | The requested failed due invalid authorisation | Creating an auction without authorisation header |
| 403         | Forbidden      | The request is refused by the server           | Deleting an auction after a bid has been placed  |


## Final notes
The Postman collection provided is a subset of what you will be marked with so passing these tests should be your highest
priority. If you find an inconsistency or issue with the reference server please reach out to Morgan English 
`morgan.english@canterbury.ac.nz`.
