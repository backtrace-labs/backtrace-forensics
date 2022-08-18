# backtrace-forensic

This is a library aimed to simplify Coroner querying in Typescript/Javascript.

# Building

```
npm install
npm run build
```

# Running tests

```
npm run test
```

# Usage

## Creating a query

You can create a query in two ways:

1. Create a `BacktraceForensic` instance and create queries from there:

    ```typescript
    import { BacktraceForensic } from 'backtrace-forensic';
    const instance = new BacktraceForensic({
        /* any options here */
    });
    const query = instance.create();
    ```

2. Use the static function from `BacktraceForensic`:

    ```typescript
    import { BacktraceForensic } from 'backtrace-forensic';
    const query = BacktraceForensic.create({
        /* any options here */
    });
    ```

### Options

You can provide options to change the behavior of the library:

-   `defaultSource`

    Data from this source will be used as defaults for API calls.

    You can override this in `getResponse()` functions in queries.

    **Example**

    ```typescript
    options.defaultSource = {
        address: 'http://sample.sp.backtrace.io',
        token: '00112233445566778899AABBCCDDEEFF',
    };

    // Will use `address` and `token` from defaults
    query.getResponse({ project: 'coroner' });
    ```

-   `queryMaker`

    Use this to override the default query maker for API calls.

    Must implement `ICoronerQueryMaker`.

    See [Overriding the query maker](#overriding-the-query-maker) for more info.

    ```typescript
    options.queryMaker = {
        query: (source, request) => {
            // make the request and return the response
        },
    };
    ```

## Using the query functions

To build a query, chain the function calls until your query is in desired state:

```typescript
query.filter('attribute', 'equal', 'abc').fold('attribute', 'head').fold('attribute', 'tail').group('fingerprint');
```

Each call creates a new query with cloned request, so it is possible to modify a query without changing the parent:

```typescript
const query = instance.create().filter('attribute', 'equal', 'abc');
const foldQuery = query.fold('attribute', 'head');
const selectQuery = query.select('attribute1', 'attribute2');
```

### Common query functions

These functions are available always, regardless of folding or selecting.

-   `limit(number)`

    Sets limit of rows in response.

    Request mutation: `request.limit = count`

    **Example**

    ```typescript
    const limitedQuery = query.limit(20);
    ```

-   `offset(number)`

    Sets how much rows to skip for response.

    Request mutation: `request.offset = count`

    **Example**

    ```typescript
    const offsetQuery = query.offset(20);
    ```

-   `template(string)`

    Sets template in request. May determine which attributes are returned.

    Request mutation: `request.template = template`

    **Example**

    ```typescript
    const templatedQuery = query.template('workflow');
    ```

-   `filter(string, FilterOperator, CoronerValueType)`

    Adds or sets a filter in request.

    Request mutation: `request.filter[attribute] += [operator, value]`

    **Example**

    ```typescript
    const filteredQuery = query
        .filter('a', 'equal', 'xyz')
        .filter('timestamp', 'at-least', 1660000000)
        .filter('timestamp', 'at-most', 1660747935);
    ```

### Select query functions

These functions are only available when selecting, and when the query is neither selected or folded.

-   `select(...string[])`

    Adds provided attributes to the select request. You can add multiple attributes at once, or chain `select` calls.

    Request mutation: `request.select += [...attributes]`

    **Example**

    ```typescript
    const selectedQuery = query.select('a').select('b').select('c');
    ```

    ```typescript
    const selectedQuery = query.select('a', 'b', 'c');
    ```

-   `select()`

    Returns the query as dynamic select. Use this to assign select attributes in runtime, without knowing the types.

    **Example**

    ```typescript
    let query = query.select();
    query = query.select('a');
    query = query.select('b');
    ```

### Fold query functions

These functions are only available when folding, and when the query is neither selected or folded.

-   `fold(string, ...FoldOperator[])`

    Adds provided fold to the request.

    Request mutation: `request.fold[attribute] += [...fold]`

    **Example**

    ```typescript
    query.fold('fingerprint', 'head').fold('fingerprint', 'tail').fold('timestamp', 'distribution', 3);
    ```

-   `fold()`

    Returns the query as dynamic fold. Use this to assign folds in runtime, without knowing the types.

    **Example**

    ```typescript
    let query = query.fold();
    query = query.fold('fingerprint', 'head');
    query = query.fold('timestamp', 'tail');
    ```

## Getting the request

At any point of querying, you can retrieve the raw request that is being built by using `getRequest` function.

You can use this request to perform a query to Coroner.

```typescript
const request = query.filter('a', 'equal', 'xyz').limit(20).select('b', 'c').getRequest();
```

## Getting the response

To get the response, you must select or fold at least once. After that, you can use the async `getResponse` function, to receive the raw response from Coroner.

Check for `error` before trying to access the actual response.

```typescript
const coronerResponse = await query.getResponse();
if (coronerResponse.error) {
    // An error happened!
    const message = coronerResponse.error.message;
    const code = coronerResponse.error.code;
    return;
}

// We got the raw response from Coroner query here!
const response = coronerResponse.response;
```

You can provide the source of data for making this query:

```typescript
const coronerResponse = await query.getResponse({
    address: 'http://sample.sp.backtrace.io',
    token: '00112233445566778899AABBCCDDEEFF',
    project: 'coroner',
});
```

## Simple responses

To simplify reading the data from the response, there are two methods in every successful response: `toArray` and `first`. These will return a simplified key-value data structure representing the data received from Coroner.

The responses will be different for selecting and folding, respectively.

### Simple select response

```typescript
const coronerResponse = await query.select('a', 'b', 'c').getResponse();
if (coronerResponse.error) {
    return;
}

const firstRow = coronerResponse.response.first();
const rows = coronerResponse.response.toArray(); // this will contain the firstRow above as the first element
for (const row of rows) {
    console.log(row.a, row.b, row.c); // prints values of attributes a, b, c
}
```

### Simple fold response

```typescript
const coronerResponse = await query
    .fold('a', 'head')
    .fold('a', 'range')
    .fold('b', 'min')
    .fold('b', 'distribution', 3)
    .group('c')
    .fold('c', 'bin', 3)
    .fold('c', 'unique')
    .getResponse();

if (coronerResponse.error) {
    return;
}

const firstRow = coronerResponse.response.first();
const rows = coronerResponse.response.toArray(); // this will contain the firstRow above as the first element
for (const row of rows) {
    console.log(row.count); // displays the group count
    console.log(row.attributes.c.groupKey); // displays the group key

    console.log(row.attributes.a.head, row.attributes.b.min); // displays the head and min values of attributes a and b
    console.log(row.attributes.a.range.from, row.attributes.a.range.to); // displays the range of attribute a

    console.log(row.attributes.c.unique); // displays the count of unique values of attribute c

    // displays all the details of distribution of b attribute
    const distributionOfB = row.attributes.b.distribution;
    console.log(distributionOfB.keys, distributionOfB.tails);
    for (const value of distributionOfB.values) {
        console.log(value);
    }

    // displays all the details of bins of c attribute
    const binOfC = row.attributes.c.bin;
    for (const bin of binOfC) {
        console.log(bin.from, bin.to, bin.count);
    }
}
```

## Available filters

These are all available filter operators that you can use in `filter` function.

### String filters

-   `at-least`
-   `at-most`
-   `contains`
-   `not-contains`
-   `equal`
-   `not-equal`
-   `greater-than`
-   `less-than`
-   `regular-expression`
-   `inverse-regular-expression`

### Number filters

-   `at-least`
-   `at-most`
-   `equal`
-   `not-equal`
-   `greater-than`
-   `less-than`

### Boolean filters

-   `equal`
-   `not-equal`

## Available folds

These are all available fold operators that you can use in `fold` function.

### Common folds

-   `head` - returns the first value in group,
-   `tail` - returns the last value in group,
-   `unique` - returns the number of unique values in group,
-   `range` - returns the range of values, from min to max,
-   `max` - returns the max value,
-   `min` - returns the min value,
-   `distribution` - returns the distribution of values, in number of specified buckets.

### String folds

String folds use only the common folds.

### Number and boolean folds

In addition to common folds, there are additional folds available:

-   `mean` - returns the mean value of all values in group,
-   `sum` - returns the sum of all values in group
-   `bin` - ? not sure how to describe this, help

## Overriding the query maker

By default, the query maker is using `http`/`https` modules in Node, and `XMLHttpRequest` in browser.

If you want to use your own implementation for making the query, provide an implementation of `ICoronerQueryMaker` to the `BacktraceForensic` options.

A Typescript class implementation of a query maker using `axios` may look like this:

```typescript
import axios from 'axios';
import { ICoronerQueryMaker } from 'backtrace-forensic';

class AxiosCoronerQueryMaker implements ICoronerQueryMaker {
    public async query<R extends QueryResponse>(
        source: QuerySource,
        request: QueryRequest
    ): Promise<CoronerResponse<R>> {
        const response = await axios.post<CoronerResponse<R>>('/api/query', request, {
            baseUrl: source.address,
            params: { project: source.project },
            headers: {
                'X-Coroner-Location': source.location ?? source.address,
                'X-Coroner-Token': source.token,
            },
        });

        return response.data;
    }
}
```

# Contact

-   Code: Sebastian Alex
