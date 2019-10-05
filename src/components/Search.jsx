import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuery, updateSearch } from './actions';
import { withRouter } from 'react-router-dom';
import { Heading, TextInput, Button, Keyboard } from 'grommet';
import MaterialIcon from 'material-icons-react';
import axios from 'axios';
import NavBar from './NavBar.jsx';
import RecipeCard from './RecipeCard.jsx';

const Search = (props) => {
  const dispatch = useDispatch();
  const search = useSelector(state => state.search);
  const preferences = useSelector(state => state.Preferences);

  const banList = () => {
    let allergies = {
      egg: preferences.egg,
      grain: preferences.grain,
      peanut: preferences.peanut,
      seafood: preferences.seafood,
      shellfish: preferences.shellfish,
      sesame: preferences.sesame,
      soy: preferences.soy,
      sulfite: preferences.sulfite,
      treeNut: preferences.treeNut,
      wheat: preferences.wheat,
      gluten: preferences.gluten,
      dairy: preferences.dairy,
    };
    return allergies;
  }

  const searchForRecipes = () => {
    axios.get('/searchRecipes', {
        params: {
          diet: preferences.diet,
          banList: banList,
          allergenList: preferences.preferences,
          searchInput: search.query
        }
      })
      .then(({ data }) => {
        dispatch(updateSearch(data));
      })
      .catch(error => console.log(error));
  };

  return (
    <div id={'search_container'}>
      <Heading className="header1">Recipes</Heading>
      <div className="recipes">
        <div className="recipes_search">
          <TextInput
            placeholder="type here"
            plain={true}
            onChange={event => dispatch(updateQuery(event.target.value))}
          />
          <Keyboard target="document" onEnter={searchForRecipes}>
            <Button
              className="primary_button"
              onClick={searchForRecipes}>
              <MaterialIcon icon="search" color='whitesmoke' size={20} />
            </Button>
          </Keyboard>
        </div>
        <hr className="recipes_divider" />
        <div className="card_container">
          {
            search.searchResults.map(recipe => {
              return <RecipeCard recipe={recipe} key={recipe.id}/>
            })
          }
        </div>
      </div>
      <NavBar />
    </div>
  )
}

export default withRouter(Search);