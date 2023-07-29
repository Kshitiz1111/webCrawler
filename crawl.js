const {JSDOM} = require('jsdom')

async function crawlPage(baseURL, currentURL, pagesObj){
   
   const baseURLObj = new URL(baseURL);
   const currentURLObj = new URL(currentURL);
   if(baseURLObj.hostname !== currentURLObj.hostname){
      return pagesObj
   }

   const normalizeCurrentURL = normalizeURL(currentURL);
   if(pagesObj[normalizeCurrentURL] > 0){
      pagesObj[normalizeCurrentURL]++
      return pagesObj;
   }
   pagesObj[normalizeCurrentURL] = 1
   console.log(`actively crawling: ${currentURL}`)


   try {
      const resp = await fetch(currentURL);

      if(resp.status > 399){
         console.log(`error in fetch with status code: ${resp.status} on page ${currentURL}`)
         return pagesObj
      }

      const contentType = resp.headers.get("content-type");

      if(!contentType.includes("text/html")){
         console.log(`non html response, content type: ${contentType}, on page ${currentURL}`)
         return pagesObj
      }

      const htmlBody = await resp.text()

      const nextURLs = getUrlsFromHTML(htmlBody, baseURL)

      for(const nextURL of nextURLs){
         pagesObj = await crawlPage(baseURL, nextURL, pagesObj)
      }
   } catch (error) {
      console.log(`error unvalid URL: ${error.message}, on page: ${currentURL}`)
   }

   return pagesObj
}

function getUrlsFromHTML(htmlBody, baseUrl){
   const urls = []
   const dom = new JSDOM(htmlBody)
   const linkElements = dom.window.document.querySelectorAll('a')
   for(const linkElement of linkElements){
      if(linkElement.href.slice(0, 1) === '/'){
         try {
            const urlObj = new URL(`${baseUrl}${linkElement.href}`)
            urls.push(urlObj.href)
         } catch (error) {
            console.log(`error with relative url: ${error.message}`)
         }
      }else{
         try {
            const urlObj = new URL(linkElement.href)
            urls.push(urlObj.href)
         } catch (error) {
            console.log(`error with absolute url: ${error.message}`)
         }
      }
   }

   return urls;
}

function normalizeURL(urlString){
   const url = new URL(urlString);
   const hostPath = `${url.hostname}${url.pathname}`;
    
   if(hostPath.length > 0 && hostPath.slice(-1) === '/'){
      return hostPath.slice(0, -1)
   }
   return hostPath
}

module.exports = { normalizeURL, getUrlsFromHTML, crawlPage }