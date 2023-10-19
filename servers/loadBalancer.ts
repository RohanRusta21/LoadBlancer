import express, { Express, Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { Request, Response } from "express-serve-static-core";
import { servers } from "..";
// import { calLoadBlancer } from "../routes/callLoadBalancer";

dotenv.config();

export const loadBalancer: Express = express();

const router: Router = Router();

let index: number = 0;
let server;

const calLoadBlancer = async (req: Request, res: Response) => {
    const sendHttpReq = async (endpoint: string) => {
        console.log(endpoint);
        const serverResponse = await axios.get(endpoint);
        const responseData = serverResponse.data;
        return responseData;
    };

    // simple RR algorithm to forward the req the 1st server, the next req to the 2nd server etc.

    let responseData = null;
    server = servers[index];

    if (index === servers.length - 1) {
        index = 0;
    } else {
        index++;
    }
    try {
        responseData = await sendHttpReq(server);
        return res.status(200).json(responseData);
    } catch (err) {
        console.log(req);

        console.log("aaaaaa", `http://${req.rawHeaders}:`);
        if (req.rawHeaders[7] in servers == true) {
            servers.forEach((s) => {
                servers.filter((el) => {
                    return el !== s;
                });
            });
            console.log(servers);
        }
        console.log("a", servers);
        res.status(500).json("Error occured please try again !");
    }
};

router.get("/", calLoadBlancer);

loadBalancer.use(router);
