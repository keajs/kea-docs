---
id: concepts
title: The Concepts of Kea
sidebar_label: Concepts
---

**WIP!** This will go in more detail what are the different parts of kea
and how to they all fit together.

Goals for this doc:

Actions
- describe actions, how they are basically param to payload converters
- actions are basically events that get dispatched and everything else just listens to them
- a helpful mental model is the one of "events" in various systems
- other than being dispatched, actions do nothing else
- they are the default entrypoint for all operations in kea
- everything else in kea happens as a reaction to an action
- actions should always return an object
- shordhand for `actionName: true` for actions without props

Reducers
- reducers change state in response to actions
- they are not just to have 1:1 relationship a'la `stuff` & `setStuff`
- reducers can react to many differet actions and set stuff accordingly, `isLoading` example
- defaults for reducers are either inline `[default, {reducer}]` or in `defaults: {}`

Listeners
- this is where side-effects happen
- listeners wait for an event to be dispatched and do what needs to happen after
- it's an anti-pattern to just use a listener and only call `setThis` actions

Selectors
- are basically computed properties
- every reducer gets a selector automatically

Values
- shorthand for calling selectors on the current store state
- used in listeners
