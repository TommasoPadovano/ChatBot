const express = require('express');
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./modules/chatbots.db');

class UserService {

  constructor(data) {
  }

  static checkCredentials(username, password) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ? AND password = ? AND role = 1', [username, password], (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (row) {
          // The user exists and the password is correct
          resolve(true);
        } else {
          // The username and/or the password are incorrect or you are not an admin
          resolve(false);
        }
      });
    });
  }

  static checkUserCredentials(username, password) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (row) {
          // The user exists and the password is correct
          resolve(true);
        } else {
          // The username and/or the password are incorrect or you are not an admin
          resolve(false);
        }
      });
    });
  }
}

module.exports = UserService;