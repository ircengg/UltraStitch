
import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useApi } from "../hooks/useApi";
import { useRecoilState } from "recoil";
import { drawingAtom, thkDataAtom } from "../atom";
import { useRecoilValue } from "recoil";

export default function ThicknessGrid() {
    const { api } = useApi();
    const [data, setData] = useRecoilState(thkDataAtom);
    const [image, setImage] = useState(null);
    const drawing = useRecoilValue(drawingAtom);
    const offCanvas = useRef(document.createElement("canvas"));





    const getData = async () => {
        const res = await api("get_registered_data");
        console.log(res)
        if (res) {
            setData(res);
        }
    };

    // Convert number matrix → rgba heatmap pixel buffer
    function generateHeatmap() {
        if (!data.matrix) return;

        const nominal = 25;

        const rows = data.matrix.length;
        const cols = data.matrix[0].length;

        offCanvas.current.width = cols;
        offCanvas.current.height = rows;

        const ctx = offCanvas.current.getContext("2d");
        const imgData = ctx.createImageData(cols, rows);
        const buffer = imgData.data;

        let idx = 0;

        for (let y = 0; y < rows; y++) {
            const row = data.matrix[y];

            for (let x = 0; x < cols; x++) {
                const v = row[x];

                if (v == null || Number.isNaN(v)) {
                    // FULLY TRANSPARENT pixel
                    buffer[idx++] = 0;
                    buffer[idx++] = 0;
                    buffer[idx++] = 0;
                    buffer[idx++] = 0;    // alpha = 0
                    continue;
                }

                let r, g, b;

                if (v < 0.8 * nominal) {
                    r = 204; g = 102; b = 0;
                }
                else if (v < 0.9 * nominal) {
                    r = 255; g = 255; b = 0;
                }
                else {
                    r = 0; g = 255; b = 0;
                }


                buffer[idx++] = r;
                buffer[idx++] = g;
                buffer[idx++] = b;
                buffer[idx++] = 255;  // opaque
            }
        }

        ctx.putImageData(imgData, 0, 0);

        const img = new window.Image();
        img.src = offCanvas.current.toDataURL();
        img.onload = () => setImage(img);
    }


    useEffect(() => {
        // console.log("thkDataChanged", data)
        if (data && data.matrix) {
            generateHeatmap();
        }
    }, [data]);

    // useEffect(() => {
    //     getData();
    // }, [])

    if (!image) return null;

    return (
        <KonvaImage
            image={image}
            width={drawing.surfaceWidth}
            height={drawing.surfaceHeight}
            listening={false}
        />
    );
}


