define([
  'Palace'
, 'Http'
], function(Palace, Http) {
  return function(view, search_stream) {
    var results = [];
    Palace.expose();
    //+ populateTable :: [Result] -> Table
    var populateTable = compose(append('table', view({})), map(render_('ResultRow')))

    //+ getResults :: String -> Promise([Result])
      , getResults = Http.get('/headlines')

    //+ cacheResults :: [Result] -> [Result]
      , cacheResults = function(xs) { return results = xs; }

    //+ makeResults :: Post -> AddView(Table)
      , makeResults = compose(updateHtml('#main'), populateTable, cacheResults)

    //+ init :: {term: String} -> EventStream(AddView(Table))
      , init = compose(fmap(makeResults), getResults) 

    //+ retrieveResult :: Id -> Result
      , retrieveResult = function(id) {
        return detectBy(pluck('id'), id, results);
      }
    //+ showHeadline :: ClickEvent -> Headline
      , showHeadline = compose(
            retrieveResult
          , pluck('id')
          , pluck('currentTarget')
        )
      ;

    fmap(init, search_stream);
    return fmap(showHeadline, on('click', '.row')); //+ :: Stream(Headline)
  };
});
