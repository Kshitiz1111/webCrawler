const { crawlPage } = require("./crawl");

async function main(){
   //why length 3?
   //because argv[0] is program interpetor or compiler in our case it is node
   //argv[1] is a path to the file that we are running
   //argv[2] is the argument provided
   if(process.argv.length < 3){
      console.log("no website provide");
      process.exit(1)
   }
   //we cannot pass more that one command line argument 
   if(process.argv.length > 3){
      console.log("too many command line args");
      process.exit(1)
   }

   const baseURL = process.argv[2];
   console.log(`starting carwl of: ${baseURL}`)

   const pages = await crawlPage(baseURL, baseURL, {})
   /**
    * The Object.entries() static method returns an
    * array of a given object's own enumerable string-keyed
    * property key-value pairs.
    */
   for(const page of Object.entries(pages)){
      console.log(page)
   }
}

main();