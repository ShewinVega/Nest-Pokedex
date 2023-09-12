import { Injectable } from '@nestjs/common';
import { PokemonResponse } from './interfaces/pokemon-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    // Adapter
    private readonly http: AxiosAdapter,
  ){}


  async executeSeed() {

    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokemonResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // Create constants Promise array due to we need to register many data from Poke API
    const insertPokemons: { name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no:number = +segments[segments.length - 2];
      
      insertPokemons.push({name,no});
    });

    await this.pokemonModel.insertMany(insertPokemons);

    return `Pokemon data was created Successfully`;
  }

}
