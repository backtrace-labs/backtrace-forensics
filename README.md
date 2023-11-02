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

1. Create a `Forensics` instance and create queries from there:

    ```typescript
    import { Forensics } from '@backtrace/forensics';
    const instance = new Forensics({
        /* any options here */
    });
    const query = instance.create();
    ```

2. Use the static function from `Forensics`:

    ```typescript
    import { Forensics } from '@backtrace/forensics';
    const query = Forensics.create({
        /* any options here */
    });
    ```

### Options

You can provide options to change the behavior of the library:

-   `defaultSource`

    Data from this source will be used as defaults for API calls.

    You can override this in `post()` functions in queries.

    **Example**

    ```typescript
    options.defaultSource = {
        address: 'http://sample.sp.backtrace.io',
        token: '00112233445566778899AABBCCDDEEFF',
    };

    // Will use `address` and `token` from defaults
    query.post({ project: 'coroner' });
    ```

-   `queryMakerFactory`

    Use this to override the default API caller for API calls.

    Must implement `ICoronerApiCallerFactory`.

    See [Overriding the API caller](#overriding-the-api-caller) for more info.

    **Example**

    ```typescript
    options.queryMaker = {
        create: () => ({
            query: (source, request) => {
                // make the request and return the response
            },
        }),
    };
    ```

-   `plugins`

    Register any plugins within this instance or query. See [Plugins](#plugins) for more info.

    **Example**

    ```typescript
    options.plugins = [myPlugin({ option: true })];
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

    Adds a filter to request.

    Request mutation: `request.filter[attribute] += [operator, value]`

    **Example**

    ```typescript
    const filteredQuery = query
        .filter('a', 'equal', 'xyz')
        .filter('timestamp', 'at-least', 1660000000)
        .filter('timestamp', 'at-most', 1660747935);
    ```

-   `filter(string, QueryAttributeFilter[])`

    Adds filters to request. You can use this requests with `Filters` helper. See [Fluent filters](#fluent-filters) for
    more info.

    Request mutation: `request.filter[attribute] += filters`

    **Example**

    ```typescript
    // filter by timestamp
    const filteredQuery = query.filter('timestamp', [
        ['at-least', 1660000000],
        ['at-most', 1660747935],
    ]);

    // filter with Filters
    const filteredQuery = query.filter('timestamp', Filters.time.from.last.hours(2).to.now());
    ```

-   `table(string)`

    Sets the table name.

    Request mutation: `request.table = table`

    **Example**

    ```typescript
    // use 'metrics' table
    query.table('metrics');
    ```

-   `json()`

    Returns the build request. The request can be posted to any Coroner /api/query endpoint.

-   `post(Partial<QuerySource>?)`

    Makes a POST call to Coroner with the built request.

    **Example**

    ```typescript
    const response = await query.post();
    if (!response.error) {
        // use the response
    }
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

-   `selectAll()`

    Selects all indexed attributes in table.

    Request mutation: `request.select_wildcard = { physical: true, virtual: true, derived: true }`

    **Example**

    ```typescript
    let query = query.selectAll();
    ```

-   `selectAll(options)`

    Selects all available indexed attributes, physical, virtual, derived, or a combination of these.

    Request mutation: `request.select_wildcard = options`

    **Example**

    ```typescript
    let query = query.selectAll({ physical: true, virtual: false });
    ```

-   `order(attribute, direction)`

    Adds order on attribute with direction specified.

    **Example**

    ```typescript
    // This will order descending on attribute 'a', then ascending on attribute 'b'
    query.select('a').select('b').order('a', 'descending').order('b', 'ascending');
    ```

### Fold query functions

These functions are only available when folding, and when the query is neither selected or folded.

-   `fold(string, ...FoldOperator)`

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

-   `removeFold(attribute, ...Partial<FoldOperator>)`

    Removes all previosuly added matching folds from the request.

    Request mutation: `request.fold[attribute] -= [...fold]`

    **Example**

    ```typescript
    const queryWithDistributions = query.fold('fingerprint', 'distribution', 3).fold('fingerprint', 'distribution', 4);

    const queryWithoutDistributions = queryWithDistributions.removeFold('fingerprint', 'distribution');
    ```

-   `group(attribute)`

    Sets the request group-by attribute. The attribute grouped by will be visible as `groupKey` in simple response.

    Request mutation: `request.group = [attribute]`

    **Example**

    ```typescript
    const groupedByFingerprint = query.group('fingerprint');
    ```

-   `order(attribute, direction, ...FoldOperator)`

    Adds order on attribute fold with direction specified.

    **Example**

    ```typescript
    // This will order descending on attribute 'a', fold 'head', then ascending on attribute 'a', fold 'tail'
    query.fold('a', 'head').fold('a', 'tail').order('a', 'descending', 'head').order('a', 'ascending', 'tail');
    ```

-   `orderByCount(direction)`

    Adds order on count with direction specified.

    **Example**

    ```typescript
    // This will order descending on count
    query.fold('a', 'head').fold('a', 'tail').orderByCount('descending');
    ```

-   `orderByGroup(direction)`

    Adds order on group with direction specified.

    **Example**

    ```typescript
    query.fold('a', 'head').fold('a', 'tail').groupBy('fingerprint').orderByGroup('descending');
    ```

-   `having(attribute, index, operator, value)`

    Adds a post-aggregation filter on params specified.

    **Example**

    ```typescript
    // Filters on 'head' fold
    query.fold('a', 'head').having('a', ['head'], 'less-than', 123);

    // Filters on 'distribution, 3' fold
    query.fold('a', 'distribution', 3).having('a', ['distribution', 3], 'less-than', { keys: 123 });
    ```

-   `having(attribute, index, operator, valueIndex, value)`

    Adds a post-aggregation filter on params specified.

    **Example**

    ```typescript
    // Filters on 'head' fold
    query.fold('a', 'head').having('a', 0, 'less-than', 0, 123);

    // Filters on 'range' fold, value 'from'
    query.fold('a', 'range').having('a', 0, 'less-than', 0, 123);

    // Filters on 'range' fold, value 'to'
    query.fold('a', 'range').having('a', 0, 'less-than', 1, 123);
    ```

-   `having(attribute, fold, operator, valueIndex, value)`

    Adds a post-aggregation filter on params specified.

    **Example**

    ```typescript
    // Filters on 'head' fold
    query.fold('a', 'head').having('a', ['head'], 'less-than', 0, 123);

    // Filters on 'range' fold, value 'from'
    query.fold('a', 'range').having('a', ['range'], 'less-than', 0, 123);

    // Filters on 'range' fold, value 'to'
    query.fold('a', 'range').having('a', ['range'], 'less-than', 1, 123);
    ```

-   `havingCount(operator, value)`

    Adds a post-aggregation filter on count.

    **Example**

    ```typescript
    query.havingCount('greater-than', 10);
    ```

-   `virtualColumn(name, type, params)`

    Adds a virtual column. The virtual column behaves like any other column.

    Request mutation: `request.virtual_columns += { name, type, [type]: params }`

    **Example**

    ```typescript
    // Adds a virtual column with name 'a'
    query.virtualColumn('a', 'quantized_uint', { backing_column: 'timestamp', size: 3600, offset: 86400 });
    ```

## Getting the request

At any point of querying, you can retrieve the raw request that is being built by using `json` function.

You can use this request to perform a query to Coroner.

```typescript
const request = query.filter('a', 'equal', 'xyz').limit(20).select('b', 'c').json();
```

## Getting the response

To get the response, you must select or fold at least once. After that, you can use the async `post` function, to
receive the raw response from Coroner.

Check for `error` before trying to access the actual response.

```typescript
const coronerResponse = await query.post();
if (!coronerResponse.success) {
    // An error happened!
    const message = coronerResponse.json().error.message;
    const code = coronerResponse.json().error.code;
    return;
}

// We got the raw response from Coroner query here!
const response = coronerResponse.json();
```

You can provide the source of data for making this query:

```typescript
const coronerResponse = await query.post({
    address: 'http://sample.sp.backtrace.io',
    token: '00112233445566778899AABBCCDDEEFF',
    project: 'coroner',
});
```

## Simple responses

To simplify reading the data from the response, there are two methods in every successful response: `toArray` and
`first`. These will return a simplified key-value data structure representing the data received from Coroner.

The responses will be different for selecting and folding, respectively.

### Simple select response

```typescript
const coronerResponse = await query.select('a', 'b', 'c').post();
if (!coronerResponse.success) {
    return;
}

const firstRow = coronerResponse.first();
const rows = coronerResponse.all().rows; // this will contain the firstRow above as the first element
for (const row of rows) {
    console.log(row.a, row.b, row.c); // prints values of attributes a, b, c
}
```

### Simple fold response

```typescript
const coronerResponse = await request
    .fold('a', 'head')
    .fold('a', 'range')
    .fold('b', 'min')
    .fold('b', 'distribution', 3)
    .fold('b', 'distribution', 5)
    .group('c')
    .fold('c', 'bin', 3)
    .fold('c', 'unique')
    .post();

if (!coronerResponse.success) {
    return;
}

const firstRow = coronerResponse.first();
const rows = coronerResponse.all().rows; // this will contain the firstRow above as the first element
for (const row of rows) {
    console.log(row.count); // displays the group count
    console.log(row.attributes.c.groupKey); // displays the group key

    console.log(row.attributes.a.head[0].value, row.attributes.b.min[0].value); // displays the head and min values of attributes a and b
    console.log(row.attributes.a.range[0].value.from, row.attributes.a.range[0].value.to); // displays the range of attribute a

    console.log(row.attributes.c.unique[0].value); // displays the count of unique values of attribute c

    // displays all the details of [distribution, 3] of b attribute
    console.log(row.attributes.b.distribution[0].fold); // prints "distribution"
    console.log(row.attributes.b.distribution[0].rawFold); // prints ["distribution", 3]
    const distributionOfB3 = row.attributes.b.distribution[0].value;
    console.log(distributionOfB3.keys, distributionOfB3.tail);
    for (const value of distributionOfB3.values) {
        console.log(value);
    }

    // displays all the details of [distribution, 5] of b attribute
    const distributionOfB5 = row.attributes.b.distribution[1];
    console.log(distributionOfB5.value.keys, distributionOfB5.value.tail);
    for (const value of distributionOfB5.value.values) {
        console.log(value);
    }

    // displays all the details of bins of c attribute
    const binOfC = row.attributes.c.bin[0].value;
    for (const bin of binOfC.values) {
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
-   `is-set`
-   `is-not-set`

### Number filters

-   `at-least`
-   `at-most`
-   `equal`
-   `not-equal`
-   `greater-than`
-   `less-than`
-   `is-set`
-   `is-not-set`

### Boolean filters

-   `equal`
-   `not-equal`
-   `is-set`
-   `is-not-set`

## Fluent filters

To simplify some attributes filtering, you can use `Filters` helper to create more complex filters with ease.

### Time filters

Use `Filters.time` to create time filters with ranges.

```typescript
import { Filters } from '@backtrace/forensics';

// Will return data from the last 2 hours
query.filter('timestamp', Filters.time.from.last.hours(2).to.now());

// Will return data from `fromDateObject` to `toDateObject`
query.filter('timestamp', Filters.time.from.date(fromDateObject).to.date(toDateObject));
```

### Range filters

Use `Filters.range` to create filters with range.

```typescript
// Will return values with _tx from range 100-500
query.filter('_tx', Filters.range(100, 500));
```

### Ticket filters

Use `Filters.ticket` to create filters for tickets.

```typescript
query.filter(Filters.ticket.state.isResolved());
```

By default it uses `fingerprint;issues;state` attribute to check status. If you are querying the `issues` table
directly, use `attribute()`:

```typescript
query.table('issues').filter(Filters.ticket.attribute('state').isResolved());
```

## Available folds

These are all available fold operators that you can use in the `fold` function.

### Common folds

-   `head` - returns the first value in group,
-   `tail` - returns the last value in group,
-   `unique` - returns the number of unique values in group,
-   `range` - returns the range of values, from min to max,
-   `max` - returns the max value,
-   `min` - returns the min value,
-   `distribution` - returns the distribution of values, in number of specified buckets,
-   `histogram` - returns count of each discrete value,
-   `object` - returns highest row ID in the group.

### String folds

String folds use only the common folds.

### Number and boolean folds

In addition to common folds, there are additional folds available:

-   `mean` - returns the mean value of all values in group,
-   `sum` - returns the sum of all values in group,
-   `bin` - ? not sure how to describe this, help.

## Available `having` filters

These are all available having operators that you can use in the `having` function.

-   `==` (`equal`)
-   `!=` (`not equal`)
-   `<` (`less-than`)
-   `>` (`greater-than`)
-   `<=` (`at-least`)
-   `>=` (`at-most`)

Filters in parentheses are supported only by Forensics, and not by Coroner itself.

## Available virtual column types

These are all available virtual column ttypes that you can use in the `virtualColumn` function.

-   `quantize_uint`

    Options:

    ```typescript
    {
        backing_column: string;
        size: number;
        offset: number;
    }
    ```

-   `truncate_timestamp`

    Options:

    ```typescript
    {
        backing_column: string;
        granularity: 'day' | 'month' | 'quarter' | 'year';
    }
    ```

## Overriding the API caller

By default, the query maker is using `http`/`https` modules in Node, and `XMLHttpRequest` in browser.

If you want to use your own implementation for making the query, provide an implementation of `ICoronerApiCallerFactory`
to the `Forensics` options. The factory should create your `ICoronerApiCaller`

A Typescript class implementation of an API caller using `axios` may look like this:

```typescript
import axios from 'axios';
import { ICoronerQueryMaker } from '@backtrace/forensics';

class AxiosCoronerQueryMaker implements ICoronerApiCaller {
    public async post<R extends QueryResponse>(
        url: string | URL,
        body?: string,
        headers?: Record<string, string>,
    ): Promise<R> {
        const response = await axios.post<R>(url, body, { headers });
        return response.data;
    }
}
```

# Plugins

As of version 0.6.0, `@backtrace/forensics` supports writing plugins. Plugins pack multiple extensions that can later
extend a `Forensics` instance.

## Importing a plugin

Pass the plugin into options while creating the instance:

```typescript
const instance = new Forensics({
    plugins: [myPlugin()],
});

const response = await instance
    .addHeadAndTailsFold('attribute')
    .addHourlyQuantizedColumn('timestamp', 'quantized_timestamp')
    .group('quantized_timestamp')
    .post();
```

## Writing a plugin

Import `Plugins` namespace from `@backtrace/forensics`, and use the `Plugins.createPlugin` function to begin. Add each
extension as a element to the plugin, for example:

```typescript
export function myPlugin() {
    return Plugins.createPlugin(
        Plugins.extendFoldCoronerQuery((context) => ({
            addHeadAndTailFolds(attribute: string) {
                return this.fold(attribute, 'head').fold(attribute, 'tail');
            },
        })),
        Plugins.extendFoldedCoronerQuery((context) => ({
            addHourlyQuantizedColumn(attribute: string, name: string) {
                return this.virtualColumn(name, 'quantized_uint', {
                    backing_column: attribute,
                    size: 3600,
                    offset: 86400,
                });
            },
        })),
    );
}
```

### Adding extensions

Use methods in the `Plugins` namespace and pass them to `createPlugin`:

-   `addQueryExtension`
-   `addFoldQueryExtension`
-   `addFoldedQueryExtension`
-   `addSelectQueryExtension`
-   `addSelectedQueryExtension`
-   `addResponseExtension`
-   `addFailedResponseExtension`
-   `addSuccessfulResponseExtension`
-   `addFoldResponseExtension`
-   `addFailedFoldResponseExtension`
-   `addSuccessfulFoldResponseExtension`
-   `addSelectResponseExtension`
-   `addFailedSelectResponseExtension`
-   `addSuccessfulSelectResponseExtension`

Each function will add functions to a specific query or response interface.

# Contact

-   Code: Sebastian Alex
