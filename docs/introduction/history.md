---
id: history
title: History of Kea
sidebar_label: History of Kea
---

Hi everyone! 👋

The Kea project began when I first started to use [Redux](https://redux.js.org/) in a
[React](https://reactjs.org/) app in 2015\.

Redux was fine, but I kept writing very similar code over and over again. Eventually I looked for ways 
to simplify things. I wrote several helper functions that automatised most of these repetitive tasks.

That loose collection of functions grew into the first public release of Kea, version 0.1 at the start 
of 2016\.

Those in turn evolved into a unified _high level abstraction over Redux_. The small helper functions 
morphed into a standardised way to describe your app's state and all the logic that manipulates it, 
including side effects. (versions 0.1 to 0.28 over 3 years).

That worked well. There were plenty of users and businesses who depended on Kea to power their apps. 
Several of them said very nice things about it.

Then things got complicated.

Changes in React and React-Redux (mostly hooks) combined with community feedback through unsolvable 
feature requests forced me to take a step back and have a fresh look at what was "Kea" and where was 
it heading. It was time for a refactor... Which turned into a rewrite... Which took on a life of 
its own... and kept [expanding and expanding and expanding](https://github.com/keajs/kea/blob/master/docs/CHANGES-1.0.md).

All of this while retaining the same bundle size as before (16kb minified -\> 17kb minified).

After 5+ months of hard work over 300+ commits Kea 1.0 was born.

It's a complete rewrite of what came before, taking Kea from being just an abstraction over Redux into 
proper framework territory.

I hope you'll have as much fun using it as I had writing it! 🤩

If you have any feedback, please reach out directly or open an [issue](https://github.com/keajs/kea/issues) on Github!

-- [Marius Andra](https://twitter.com/mariusandra)