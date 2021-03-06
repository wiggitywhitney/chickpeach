import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateView, updateServings, updateMenu } from './actions';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Button } from "grommet";
import NavBar from './NavBar.jsx';

const RecipeView = (props) => {
  const [recipe, updateRecipe] = useState({});
  const dispatch = useDispatch();
  const { view, servings } = useSelector(state => state.Menu);
  const preferences = useSelector(state => state.Preferences);
  
  const formatter = {
    Carbohydrates: 'Carbs',
    Sugar: 'Sugar',
    Fat: 'Fat',
    Sodium: 'Sodium',
    Fiber: 'Fiber',
    'Saturated Fat': 'Saturated Fat',
    Protein: 'Protein'
  }

  const getTotalServings = (recipes) => {
    let servings = 0;
    recipes.forEach(recipe => {
      servings += recipe.servings
    });
    return servings;
  };

  const getRecipe = () => {
    if (view === 'Search') {
      axios.get('/getSingleRecipe', {
        params: {
          recipeID: props.history.location.state.id
        }
      })
      .then(({ data }) => {
        updateRecipe(data);
      })
      .catch(error => console.log(error))
    } else {
      axios.get('/getsingledbrecipe', {
        params: {
          recipeID: props.history.location.state.id
        }
      })
      .then(({ data }) => {
        updateRecipe(data);
      })
      .catch(error => console.log(error))
    }
  };

  const getMenu = () => {
    axios.get('/menuitems', {
        params: {
          user_id: preferences.uid
        }
      })
      .then(({ data }) => {
        const servingCount = getTotalServings(data)
        dispatch(updateServings(servingCount));
        dispatch(updateMenu(data));
      })
      .catch(error => console.log(error));
  };

  // Menu -> Recipe View
  const addToFavorites = () => {
    axios.put('/addtofavorites', {
      user_id: preferences.uid,
      recipe_id: props.history.location.state.id
    })
    .then (({ data }) => {
      if (data === 'already on favorites') {
        alert ('Recipe already in favorites')
      } else {
        dispatch(updateView('Favorites'));
        alert('Recipe added to favorites');
        props.history.replace('/menu');
      }
    })
    .catch(error => console.log(error));
  };

  const removeFromMenu = () => {
    axios.put('/removemenuitem', {
      user_id: preferences.uid,
      recipe_id: props.history.location.state.id
    })
    .then(dispatch(updateServings(servings - props.history.location.state.servings)))
    .then(dispatch(updateView('Menu')))
    .then(alert('Successfully removed recipe from menu'))
    .then(
      props.history.replace('/menu')
    )
    .catch(error => console.log(error));
  };

  // Favorites -> Recipe View
  const addToMenu = () => {
    axios.put('/addtomenu', {
      user_id: preferences.uid,
      recipe_id: props.history.location.state.id
    })
    .then(({ data }) => {
      if (data === 'already on menu') {
        alert('Recipe already on menu');
      } else {
        dispatch(updateView('Menu'));
        alert('Recipe added to menu');
        props.history.replace('/menu');
      }
    })
    .catch(error => console.log(error));
  };

  const removeFromFavorites = () => {
    axios.put('/removefromfavorites', {
      user_id: preferences.uid,
      recipe_id: props.history.location.state.id
    })
    .then(dispatch(updateView('Favorites')))
    .then(alert('Successfully removed recipe from favorites'))
    .then(
      props.history.replace('/menu')
    )
    .catch(error => console.log(error));
  };

  // Search -> Recipe View
  const addToMenuFromSearch = () => {
    axios.post('/addrecipe', {
      params: {
        action: 'menu',
        user: preferences.uid
      },
      data: recipe
    })
      .then(alert('Successfully added recipe to menu'))
      .then(getMenu())
      .catch(error => console.log(error));
  };
  
  const addToFavoritesFromSearch = () => {
    axios.post('/addrecipe', {
      params: {
        action: 'fave',
        user: preferences.uid
      },
      data: recipe
    })
      .then(alert('Successfully added recipe to favorites'))
      .then(getMenu())
      .catch(error => console.log(error));
  };

  // History -> Recipe View
  const removeFromHistory = () => {
    axios.put('/removefromhistory', {
      user_id: preferences.uid,
      recipe_id: props.history.location.state.id
    })
    .then(dispatch(updateView('History')))
    .then(alert('Recipe removed from history'))
    .then(
      props.history.replace('/menu')
    )
    .catch(error => console.log(error));
  };

  useMemo(() => { // If useMemo doens't work with all items, replace with useEffect
    getRecipe();
  }, [recipe.id])

  // Render empty div if axios request has not yet updated recipe
  if (Object.entries(recipe).length === 0 && recipe.constructor === Object) {
    return <div />
  }

  return (
    <div id='recipeView_container'>
      <h1 className={'header1'}>{recipe.title}</h1>
      <div className={'recipeView_content'}>
        <img className={'recipe_hero'} title={recipe.title} alt={recipe.title} src={recipe.image} />
        <div className={'grey_container'}>
          <h3>Ingredients</h3>
          {
            recipe.ingredients.map((ingredient, index) => {
              return <p className={'recipe_ingredient'} key={index}>
                {`${ingredient.stringRender}`}
              </p>
            })
          }
        </div>

        <div id={'recipe_directions_container'}>
          <h3 className={'recipe_directions_label'}>Directions</h3>
          <p>{`${recipe.prep_time} minutes`}</p>
          {
            recipe.directions.map((step, index) => {
              return (
                <div className={'recipe_step'} key={index}>
                  <div className={'recipe_step_number'}>{index + 1 + '.'}</div>
                  <div>{step}</div>
                </div>
              )
            })
          }
        </div>

        <div className={'grey_container'}>
          <h3 className={'nutrition_header'}>Nutritional Information</h3>
          <div className={'nutrition_header'}>Servings Per Recipe: {recipe.servings}</div>
          <div className={'nutrition_header'}>Amount Per Serving</div>
          <div className={'nutrition_header calories'}>{`Calories ${Math.round(recipe.nutrition_info[0].amount / 10) * 10}`}</div>
          {
            recipe.nutrition_info.map((nutrient, index) => {
              if (formatter[nutrient.title]) {
                return (
                  <div className={'nutrient_row'} key={index}>
                    <div>{nutrient.title}</div>
                    <div>{Math.ceil(nutrient.amount) + nutrient.unit}</div>
                  </div>
                );
              }
            })
          }
        </div>
          {view === 'Menu' && (
              <div className='recipe_buttons'>
                <Button className={'primary_button recipe_button'} primary onClick={addToFavorites}>Add to favorites</Button>
                <Button className={'secondary_button recipe_button'} primary onClick={removeFromMenu}>Remove from menu</Button>
              </div>
            )}
          {view === 'Favorites' && (
            <div className='recipe_buttons'>
              <Button className={'primary_button recipe_button'} primary onClick={addToMenu}>Add to menu</Button>
              <Button className={'secondary_button recipe_button'} primary onClick={removeFromFavorites}>Remove from favorites</Button>
            </div>
          )}
          {view === 'History' && (
            <div className='recipe_buttons'>
              <Button className={'primary_button recipe_button'} primary onClick={addToMenu}>Add to menu</Button>
              <Button className={'secondary_button recipe_button'} primary onClick={removeFromHistory}>Remove from history</Button>
            </div>
          )}
          {view === 'Search' && (
            <div className='recipe_buttons'>
              <Button className={'primary_button recipe_button'} primary onClick={addToMenuFromSearch}>Add to menu</Button>
              <Button className={'secondary_button recipe_button'} primary onClick={addToFavoritesFromSearch}>Add to favorites</Button>
            </div>
          )}
        <NavBar />
      </div>
    </div>
  )
}

export default withRouter(RecipeView);