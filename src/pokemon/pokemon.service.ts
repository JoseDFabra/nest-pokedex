import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Delete } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';
import { IsString } from 'class-validator';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error);
    } 

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon = null;

    // no
    if ( !isNaN(+term) ){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //mongo id
    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById( term );
    }

    //name
    if( !pokemon ){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()});
    }
    
    if( !pokemon ){
      throw new NotFoundException(`this pokemon is not exist in te DB:  ${term}`)
    }
  


    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {


    const pokemon = await this.findOne(term );

    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim(); 
    }
    try {
      await pokemon.updateOne(updatePokemonDto);
      
    } catch (error) {
      this.handleExceptions(error);
    }
    


    return {...pokemon.toJSON(), ...updatePokemonDto};
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(term);
    // await pokemon.deleteOne();    
    //return {id}
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const iid = id;
    const {deletedCount, acknowledged}= await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0){
      throw new NotFoundException(`this pokemon is not exist in te DB:  ${id}`)
    }


    return `${iid} was deleted` ;

  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exist in DB ${ JSON.stringify(error.keyValue) } `)
    }    
    else{
      console.log(error);
      throw new InternalServerErrorException(`Can't updatePokemon - Cher server logs`)
    }    
  }

}
