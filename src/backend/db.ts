import Datastore from '@seald-io/nedb';
import { Question } from '../models/question'

export async function greet(db: Datastore): Promise<void> {
    await db.insertAsync([{ a: 5 }, { a: 42 }, { a: 5 }])
    const docs = await db.findAsync({ a: 5 })
}

export class QuestionBank {
    private db: Datastore;
  
    constructor(db: Datastore) {
      this.db = db;
    }

    public async get_question_by_title(title: String): Promise<Question> {
        return new Promise<Question>((resolve, reject) => {
            this.db.findOne({title: title}, (err: any, doc: Question) => {
              if (err) {
                return reject(err);
              }
              resolve(doc);
            });
          });
    }

    public async insert_question(question: Question): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.insert(question, (err: any) => {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
          });
    }

    public async update_question(title: String): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.update({title: title}, (err: any, numberOfUpdated: number) => {
                if (err) {
                  return reject(err);
                }
                resolve(numberOfUpdated);
              });
          });
    }

    public async delete_question(title: String): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.remove({title: title}, (err: any, numberOfUpdated: number) => {
                if (err) {
                  return reject(err);
                }
                resolve(numberOfUpdated);
              });
          });
    }

}