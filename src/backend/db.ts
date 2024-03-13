import Datastore from '@seald-io/nedb';
import { Question } from '../utils/types'

export class QuestionBank {
    private db: Datastore;
  
    constructor(db: Datastore) {
      this.db = db;
    }

    public async get_question(title: String): Promise<Question> {
        return new Promise<Question>((resolve, reject) => {
            this.db.findOne({question: title}, (err: any, doc: Question) => {
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
            this.db.update({question: title}, (err: any, numberOfUpdated: number) => {
                if (err) {
                  return reject(err);
                }
                resolve(numberOfUpdated);
              });
          });
    }

    public async delete_question(title: String): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.remove({question: title}, (err: any, numberOfUpdated: number) => {
                if (err) {
                  return reject(err);
                }
                resolve(numberOfUpdated);
              });
          });
    }

}