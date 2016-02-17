import React from 'react';
import { Route, IndexRoute } from 'react-router';


import App from './containers/App';
import AppOption from './containers/AppOption';


import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import RecordPage from './containers/RecordPage';


export default (
    <Route path="/" component={App}>
        <IndexRoute component={HomePage}/>
        <Route path="/counter" component={CounterPage}/>
        <Route path="/record" component={RecordPage}/>
        <Route path="/about-fox" component={RecordPage}/>
        <Route path="/fox-option" component={AppOption}/>
    </Route>
);
