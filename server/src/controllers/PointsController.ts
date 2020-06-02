import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response){
    const {city,uf,items} = request.query;

    //divide o query param ITEMS removendo os espaços e separando pelas virgulas
    const parsedItems = String(items)
      .split(',')
      .map(item => 
        Number(item.trim())
      );

      //faz um join nas tabelas points e point_items onde o id do points seja igual ao point_id da tabela point_items
      //whereIn procura onde o campo item_id da tabela point_items contenha algum dos items passados na variavel parsedItems
      //convertemos os campos para o tipo String para prevenir qualquer problema como campo uf e city
      //distinct para nao trazer registros duplicados caso um POINT colete os items 1 e 2, ele retorne o local uma vez só e nao duas
      //select apenas nos campos da tabela points e nao point_items
      const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');
        
      return response.json(points);
  }

  async show(request: Request, response: Response){
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point){
      return response.status(400).json({message: 'Point not found'});
    }
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({point,items});
  }

  async create(request: Request, response: Response) {
    const { 
      name,
      email,
      whatsapp,
      latitude,longitude,
      city,uf,
      items
    } = request.body;
  
    //transaction do express, utilizado para garantir que todas as querys sejam executadas
    //e caso alguma falhe as outras tambem encerrem
    const trx = await knex.transaction(); 
    const point = {
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', 
      name,
      email,
      whatsapp,
      latitude,longitude,
      city,uf
    }
  
    //retorna o id para ser utilizado na tabela pivot
    const insertedIds = await trx('points').insert(point);
  
  
    const point_id = insertedIds[0];
  
  
    //recupera a array de itens e para cada item adiciona o ID do Point
    // esse objeto pointItems  sera inserido na tabela point_items abaixo
    const pointItems = items.map((item_id : number) => {
      return {
        item_id,
        point_id
      };
    })
  
    await trx('point_items').insert(pointItems);
  
    await trx.commit(); //Commita após as transações

    return response.json({
      id:point_id,
      ...point,});
  }
  
}

export default PointsController;