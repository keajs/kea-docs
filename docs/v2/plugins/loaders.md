---
id: loaders
title: Loaders
sidebar_label: Loaders
---

When making network requests that fetch data, you end up writing the same thing over and over again:

1. an action to make the request
2. an action to handle success
3. an action to handle errors
4. a reducer to store the data
5. a reducer to store the loading state
6. a listener to make the request and return the data

The `kea-loaders` plugin abstracts this pattern into a system of loaders.

# Installation

First install the [`kea-loaders`](https://github.com/keajs/kea-loaders) package:

```shell
# if you're using yarn
yarn add kea-loaders

# if you're using npm
npm install --save kea-loaders
```

Then install the plugin:

```javascript
import { loadersPlugin } from 'kea-loaders'
import { resetContext } from 'kea'

resetContext({
    plugins: [
        loadersPlugin({
            /* options */
        })
    ],
})
```

## Configuration options

The plugin takes the following options:

```javascript
loadersPlugin({
    // Called when any loader is started
    onStart({ logic, reducerKey, actionKey }) {
        // start a global spinner
    },  
  
    // Called when any loader was successful
    onSuccess({ response, logic, reducerKey, actionKey }) {
        // stop that global spinner
    },  

    // Called when the listener throws an error
    // Feel free to alert the user in a nicer way,
    // for example by displaying a notification.
    // Also connect this to your bug tracking software.
    onFailure({ error, logic, reducerKey, actionKey }) {
        console.error(`Error in ${actionKey} for ${reducerKey}:`, error)
    },
})
```

## Sample usage

```javascript
import { kea } from 'kea'

export const projectLogic = kea({
    key: props => props.id,
    
    loaders: ({ values, props }) => ({
        project: {
            loadProject: (id = props.id) => projectsService.get(id)
        },
        
        // the above code creates these actions:
        // - loadProject: params => params
        // - loadProjectSuccess: project => ({ project })
        // - loadProjectFailure: error => ({ error })
        
        // ... and these reducers:
        // - project (whatever the loadProject loader returns)
        // - projectLoading (true or false)
        
        apiKeys: [[], { // default empty array instead of null
            loadApiKeys: () => apiKeysService.find({ query: { projectId: props.id } }),
            createApiKey: async () => {
                const apiKey = await apiKeysService.create({ projectId: props.id })
                return [...(values.apiKeys || []), apiKey]
            }
        }]
        
        // the above code creates these actions:
        // - loadApiKeys: true
        // - loadApiKeysSuccess: apiKeys => ({ apiKeys })
        // - loadApiKeysFailure: error => ({ error })
        // - createApiKey: true
        // - createApiKeySuccess: apiKeys => ({ apiKeys })
        // - createApiKeyFailure: error => ({ error })
        
        // ... and these reducers:
        // - apiKeys (whatever the loadProject loader returns)
        // - apiKeysLoading (true or false)
    }),
    
    // start the loaders after mounting the logic
    events: ({ actions }) => ({
        afterMount: [
            actions.loadProject,
            actions.loadApiKeys
        ]
    })
})

export function Project ({ id }) {
    const { project, projectLoading } = useValues(projectLogic({ id }))
    const { loadProject } = useActions(projectLogic({ id }))

    return (
        <div>
            {projectLoading ? (
                <div>Loading project</div>
            ) : project ? (
                <div>Project: {project.id}</div>
            ) : (
                <div>No project found!</div>
            )}
            
            <button onClick={() => loadProject(id)}>Reload project</button>
            
            <button onClick={() => loadApiKeys()}>Load API keys</button>
            {/* In case your loader function takes no arguments, we recommend */}
            {/* passing onClick={() => loadProject()} in the click handler.   */}
            {/* Using just onClick={loadProject} will pass the click event as */}
            {/* a param to the action and that may cause unexpected issues... */}
        </div>
    )
}
```

## Overriding reducers

In case you need to override `project` or `projectLoading`, just override the reducers:

```javascript
export const projectLogic = kea({
    key: props => props.id,

    actions: {
        setAsFinished: true
    },

    loaders: ({ values, props }) => ({
        project: {
            loadProject: (id = props.id) => projectsService.get(id)
        },
    }),
    
    reducers: {
        project: {
            setAsFinished: (state) => state ? { ...state, finished: true } : state
        },
        // only switch to "true" the first time the project loads by
        // using `null` as a third state
        projectLoading: {
            loadProject: (state) => state === false ? true : state,
            loadProjectSuccess: () => null,
            // loadProjectFailure is unmodified
        }
    }
})
```

In case you want to override the default after the fact, it's not possible to do so by passing
a new default to `reducers`. You must instead pass the new default to `defaults`

For example: 

```javascript
kea({
    defaults: { 
        projectLoading: 'not yet' 
    }
})
```