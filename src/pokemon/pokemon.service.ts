import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreatePokemonDto } from "./dto/create-pokemon.dto";
import { UpdatePokemonDto } from "./dto/update-pokemon.dto";
import { Pokemon } from "./entities/pokemon.entity";
import { Model, isValidObjectId } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class PokemonService {


  /**
   * The constructor function injects the Pokemon model into the class.
   * @param pokemonModel - The `pokemonModel` parameter is of type `Model<Pokemon>`. It is injected
   * using the `@InjectModel` decorator and represents the Mongoose model for the `Pokemon` collection
   * in the database. It allows you to perform database operations on the `Pokemon` collection, such as
   * creating,
   */
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  /**
   * The function creates a new Pokemon in the database, converting the name to lowercase and handling
   * duplicate entries.
   * @param {CreatePokemonDto} createPokemonDto - The createPokemonDto is an object that contains the
   * data needed to create a new Pokemon. It likely has properties such as "name", "type", "level",
   * etc.
   * @returns the created Pokemon object.
   */
  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();

      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon already exist in Database: ${JSON.stringify(error.keyValue)}`
        );
      }
      console.log(error);
      throw new InternalServerErrorException(
        `Can't create Pokemon -- Check Server Logs`
      );
    }
  }

  /**
   * The `findAll` function retrieves all data from the `pokemonModel` collection.
   * @returns The `findAll` function is returning the data retrieved from the `pokemonModel.find({})`
   * query.
   */
  async findAll() {
    
    const data = await this.pokemonModel.find({});

    return data;
  }

  /**
   * The function `findOne` searches for a Pokemon based on a given term, which can be the Pokemon's
   * number, ID, or name.
   * @param {string} term - The term parameter is a string that represents the search term for finding
   * a Pokemon. It can be either the Pokemon's number, name, or MongoDB ID.
   * @returns a Pokemon object.
   */
  async findOne(term: string) {
    let pokemon: Pokemon;

    // Number of Pokemon
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // Mongo ID
    if (!pokemon && isValidObjectId(term))
      pokemon = await this.pokemonModel.findById(term);

    // Pokemon's Name
    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no: ${term} not Found`
      );

    return pokemon;
  }

  /**
   * The function updates a Pokemon's information and returns the updated Pokemon.
   * @param {string} term - The term parameter is a string that represents the search term used to find
   * the Pokemon. It could be the name, ID, or any other identifier of the Pokemon.
   * @param {UpdatePokemonDto} updatePokemonDto - The `updatePokemonDto` parameter is an object that
   * contains the updated information for a Pokemon. It may have the following properties:
   * @returns an object that combines the properties of the original Pokemon object and the updated
   * Pokemon object.
   */
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      // We are going to seek the Pokemon
      const pokemon = await this.findOne(term);

      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();

      await pokemon.updateOne(updatePokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  /**
   * The function removes a Pokemon from the database based on its ID and returns a success message if
   * the deletion was successful, otherwise it throws an exception.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * Pokemon that needs to be removed.
   * @returns a string message "Pokemon was deleted" if the deletion was successful. If the deletion
   * was not successful, it throws a BadRequestException with a message "Pokemon with id: {id} not
   * Found".
   */
  async remove(id: string) {
   const { deletedCount } = await this.pokemonModel.deleteOne({_id:id});

    if(deletedCount !== 0)
      return `Pokemon was deleted`;

    throw new BadRequestException(`Pokemon with id: ${JSON.stringify(id)} not Found`);

  }


  /**
   * The function handles exceptions by checking for a specific error code and throwing appropriate
   * exceptions.
   * @param {any} error - The error parameter is of type "any", which means it can accept any type of
   * value. In this case, it is expected to be an object representing an error.
   */
  private handleExceptions( error: any ) {

    if ( error.code === 11000 ) 
      throw new BadRequestException(`This Pokemon's property exist in other register`);

    throw new InternalServerErrorException(`Pokemon couldn't be updated!`);

  }

}
