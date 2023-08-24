import { 
  IsInt, 
  IsPositive, 
  IsNotEmpty,
  IsString,
  MinLength 
} from "class-validator";


export class CreatePokemonDto {

  @IsPositive({ message: `Pokemon's number must be Positive` })
  @IsInt({ message: `Pokemon's number must be a integer number` })
  @IsNotEmpty({ message: `Pokemon's number is required` })
  no: number;

  @IsNotEmpty({ message: `Pokemon's name is required` })
  @IsString({ message: `Pokemon's name must be a valid text` })
  @MinLength(1,{ message: `Pokemon's name must have at least 1 character`})
  name: string;

}
