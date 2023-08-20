import mergeImages from 'merge-images'
import {Canvas, Image} from 'canvas'
import {staticIcons} from '../constants/staticIcons'
import fs from 'fs'
import crypto from 'crypto'
import sharp from 'sharp'

const fetch = require('node-fetch')
import { writeFile } from "fs/promises"

sharp.cache(false);

async function downloadFile(url:string, outputPath:string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const stream = Buffer.from(await blob.arrayBuffer())
    await writeFile(outputPath, stream);
}

export const getMergedThumbnail = async (arg0: (string | number)[], arg1: (string | number)[]) => {
    let token0Img = `${arg0[3] as string}`
    let token1Img = `${arg1[3] as string}`

    if (arg0[0] === 'equilibre-finance') {
        token0Img = staticIcons.velodromeIcon
    }

    if (arg1[0] === 'equilibre-finance') {
        token1Img = staticIcons.velodromeIcon
    }

    if (arg1[0] === 'eq-token') {
        token1Img = staticIcons.velodromeIcon
    }

    if (arg1[0] === 'equilibre-finance') {
        token1Img = staticIcons.velodromeIcon
    }

    if (arg1[0] === 'optimism') {
        token1Img = staticIcons.optimismIcon
    }

    if ((arg0[3] as string).startsWith('https')) {
        token0Img = arg0[3] as string
    }

    if ((arg1[3] as string).startsWith('https')) {
        token1Img = arg1[3] as string
    }

    const hash0 = crypto.createHash('sha256').update(token0Img).digest('hex');
    const hash1 = crypto.createHash('sha256').update(token1Img).digest('hex');
    const cache0 = `/tmp/${hash0}.png`;
    const cache1 = `/tmp/${hash1}.png`;
    if (!fs.existsSync(cache0)) {
        const cache0Downloaded = `/tmp/${hash0}-download.png`;
        await downloadFile(token0Img, cache0Downloaded);
        await sharp(cache0Downloaded).resize(55).toFile(cache0);
    }
    if (!fs.existsSync(cache1)) {
        const cache1Downloaded = `/tmp/${hash1}-download.png`;
        await downloadFile(token1Img, cache1Downloaded);
        await sharp(cache1Downloaded).resize(55).toFile(cache1);
    }

    token0Img = cache0;
    token1Img = cache1;

    const b64 = await mergeImages(
        [
            {src: token1Img, x: 40, y: 0},
            {src: token0Img, x: 0, y: 0},
        ],
        {width: 100, height: 55, Canvas: Canvas, Image: Image},
    )
    const b64StrippedHeader = b64.split(';base64,').pop()
    return b64StrippedHeader
}



export const getThumbnail = (arg0: (string | number)[]) => {
    let token0Img = `${arg0[3] as string}`
    if (arg0[0] === 'equilibre-finance') {
        token0Img = staticIcons.velodromeIcon
    }
    if (arg0[0] === 'velodrome-finance') {
        token0Img = staticIcons.velodromeIcon
    }
    if (arg0[0] === 'optimism') {
        token0Img = staticIcons.optimismIcon
    }
    return token0Img
}
