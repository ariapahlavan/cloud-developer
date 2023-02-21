import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query (DONE)
  //    2. call filterImageFromURL(image_url) to filter the image (DONE)
  //    3. send the resulting file in the response (DONE)
  //    4. deletes any files on the server on finish of the response (DONE)
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get('/filteredimage', async (req: Request, res: Response) => {
      const imageUrl: string | undefined = req.query.image_url;
      if (!imageUrl) {
          res.status(404).send('Please provide an `image_url` query parameter.')
      }
      try {
          const filteredImageFilepath: string = await filterImageFromURL(imageUrl);
          res.status(200).sendFile(filteredImageFilepath);
          res.on('finish', async () => await deleteLocalFiles([filteredImageFilepath]));
      } catch (_e) {
          res.status(422).send('Could not process the image.')
      }
  })
  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
