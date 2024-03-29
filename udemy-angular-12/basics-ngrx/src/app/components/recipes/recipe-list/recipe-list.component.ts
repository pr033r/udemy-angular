import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RecipeService } from 'src/app/shared/recipe.service';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  /*
  Before Services were used
  @Output('onRecipeWasSelected') selectedRecipeItem = new EventEmitter<Recipe>();
  */

  recipes: Recipe[] = [];
  recipesChanged?: Subscription;

  /*
  Before Services were used

  recipes: Recipe[] = [
    new Recipe('Test1', 'some description', 'https://www.seriouseats.com/thmb/ZtZ4--lBfp17SBEmmwM8D40s8vg=/768x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2019__02__20190122-souffle-omelet-vicky-wasik-16-a6947c73ed974fcea682a6554553221b.jpg'),
    new Recipe('Test2', 'some description', 'https://www.seriouseats.com/thmb/ZtZ4--lBfp17SBEmmwM8D40s8vg=/768x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2019__02__20190122-souffle-omelet-vicky-wasik-16-a6947c73ed974fcea682a6554553221b.jpg'),
    new Recipe('Test3', 'some description', 'https://www.seriouseats.com/thmb/ZtZ4--lBfp17SBEmmwM8D40s8vg=/768x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2019__02__20190122-souffle-omelet-vicky-wasik-16-a6947c73ed974fcea682a6554553221b.jpg'),
    new Recipe('Test4', 'some description', 'https://www.seriouseats.com/thmb/ZtZ4--lBfp17SBEmmwM8D40s8vg=/768x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2019__02__20190122-souffle-omelet-vicky-wasik-16-a6947c73ed974fcea682a6554553221b.jpg')
  ];*/

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipes = this.recipeService.getRecipes();
    this.recipesChanged = this.recipeService.recipesChanged.subscribe(
      (recipes: Recipe[]) => {
        this.recipes = recipes;
      }
    );
  }

  ngOnDestroy(): void {
    this.recipesChanged?.unsubscribe();
  }
  /*
  Before Services were used

  detailOfSelectedItem(selectedRecipe: Recipe) {
    this.selectedRecipeItem.emit(selectedRecipe);
  }
  */
}
