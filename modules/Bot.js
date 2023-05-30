class Bot {
  static id = this.id;
  static name = this.name;
  static brains = this.brains;
  static mouths = this.mouths;
  static history = this.history;
  static image = this.image;
  static status = this.status;

  constructor(data) {
    console.log(`Creating a new bot...`);

    if (data.id !== undefined) {
      if (typeof data.id !== "number") {
        throw new Error("Bot Creation: passed id is not a number");
      }
      this.id = data.id;
    } else {
      const min = 100;
      const max = 999;
      // we can add the fact that the given id should be unique
      this.id = Math.floor(Math.random() * (max - min + 1)) + min; //Generate a random number between 100 and 999 as id
    }


    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        throw new Error("Bot Creation: passed name is not a string");
      }
      this.name = data.name;
    } else {
      this.name = "Bot with no name :(";
    }

    if (data.brains !== undefined) {
      if (!Array.isArray(data.brains) || !data.brains.every(item => typeof item === "string")) {
        throw new Error("Bot Creation: passed brains is not an array of strings");
      }
      this.brains = data.brains;
    } else {
      this.brains = [];
    }

    if (data.mouths !== undefined) {
      if (!Array.isArray(data.mouths) || !data.mouths.every(item => typeof item === "string")) {
        throw new Error("Bot Creation: passed mouths is not an array of strings");
      }
      this.mouths = data.mouths;
    } else {
      this.mouths = [];
    }

    if (data.history !== undefined) {
      if (!Array.isArray(data.history)) {
        throw new Error("Bot Creation: passed history is not an array");
      }
      this.history = data.history;
    } else {
      this.history = [];
    }

    if (data.image !== undefined) {
      if (typeof data.image !== "string") {
        throw new Error("Bot Creation: passed image is not a string");
      }
      this.image = data.image;
    } else {
      this.image = "";
    }
  }

  static isBot(anObject) {
    const mandatoryProperties = ["name", "brains", "mouths", "history", "image"];
    const hasMandatoryProperties = mandatoryProperties.every(property => Object.prototype.hasOwnProperty.call(anObject, property));
    if (!hasMandatoryProperties) {
      return false;
    }

    if (!Array.isArray(anObject.brains) || !anObject.brains.every(item => typeof item === "string")) {
      return false;
    }

    if (!Array.isArray(anObject.mouths) || !anObject.mouths.every(item => typeof item === "string")) {
      return false;
    }

    if (!Array.isArray(anObject.history)) {
      return false;
    }

    if (typeof anObject.image !== "string") {
      return false;
    }

    return true;
  }

  static isValidProperty(propertyName, propertyValue) {
    switch (propertyName) {
      case "id":
        return typeof propertyValue === "number";
      case "name":
        return typeof propertyValue === "string";
      case "brains":
        return Array.isArray(propertyValue) && propertyValue.every(item => typeof item === "string");
      case "mouths":
        return Array.isArray(propertyValue) && propertyValue.every(item => typeof item === "string");
      case "history":
        return Array.isArray(propertyValue);
      case "image":
        return typeof propertyValue === "string";
      default:
        return false;
    }
  }
}

module.exports = Bot;