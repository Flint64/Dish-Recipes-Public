import { Direction } from './direction.model';
import { Ingredient } from './ingredient.model';

export class Recipe {
    constructor(
        public _id: string,
        public name: string,
        public description: string,
        public ingredients: Ingredient[],
        public directions: Direction[],
        public notes: string,
        public tags: string[],
        public user: string,
        public date: Date,
        public imgUrl: string
    ) { }
}