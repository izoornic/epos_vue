const priceMixin = {
  methods: {
     /**
     * @description converts number to given decimal points
     * @params price : Number || String
     * @params decimalPoints : Number || default to 2
     */
    addDecimalPoints(price, decimalPoints = 2) {
      price = String(price);

      // for . adding 1 to decimalpoints
      decimalPoints = decimalPoints + 1;

      if(!price) {
        return;
      }

      let indexOfDot = price.indexOf(".");
      if(indexOfDot == -1) {
        price = price+'.00';
      } else {
        price = (indexOfDot >= 0) ? (price.substr(0, indexOfDot) + price.substr(indexOfDot, decimalPoints)) : price;
        
        if(price.substr(indexOfDot).length != decimalPoints) {
          price = price.padEnd(price.length+(decimalPoints - price.substr(indexOfDot).length), "0");
        }
      }

      return price;
    },
  }
};

export default priceMixin;