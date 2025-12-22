

// import React, { useEffect, useState } from "react";
// import { Image as KonvaImage } from "react-konva";
// import { useRecoilValue } from "recoil";
// import useImage from "use-image";
// import { drawingAtom, staticServerAtom } from "../atom";

// function matchColor(r, g, b, target, tol = 5) {
//   return (
//     Math.abs(r - target[0]) < tol &&
//     Math.abs(g - target[1]) < tol &&
//     Math.abs(b - target[2]) < tol
//   );
// }

// export default function ThicknessGrid({
//   showGood = true,
//   showWarn = true,
//   showBad = true,
// }) {
//   const static_server_url = useRecoilValue(staticServerAtom);
//   const drawing = useRecoilValue(drawingAtom);

//   const [srcImage] = useImage(
//     `${static_server_url}/registration/registration_map.png`,
//     // "anonymous"
//   );

//   const [filteredImage, setFilteredImage] = useState(null);

//   useEffect(() => {
//     if (!srcImage) return;

//     const canvas = document.createElement("canvas");
//     canvas.width = srcImage.width;
//     canvas.height = srcImage.height;

//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(srcImage, 0, 0);

//     const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     const d = imgData.data;

//     for (let i = 0; i < d.length; i += 4) {
//       const r = d[i];
//       const g = d[i + 1];
//       const b = d[i + 2];

//       let keep = false;

//       if (showGood && matchColor(r, g, b, [0, 255, 0])) keep = true;
//       if (showWarn && matchColor(r, g, b, [255, 255, 0])) keep = true;
//       if (showBad && matchColor(r, g, b, [204, 102, 0])) keep = true;

//       if (!keep) {
//         d[i + 3] = 0; // make transparent
//       }
//     }

//     ctx.putImageData(imgData, 0, 0);

//     const img = new Image();
//     img.src = canvas.toDataURL();
//     img.onload = () => setFilteredImage(img);
//   }, [srcImage, showGood, showWarn, showBad]);

//   if (!filteredImage) return null;

//   return (
//     <KonvaImage
//       image={filteredImage}
//       width={drawing.surfaceWidth}
//       height={drawing.surfaceHeight}
//       listening={false}
//     />
//   );
// }























import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { useRecoilValue } from "recoil";
import { drawingAtom, staticServerAtom } from "../atom";


export default function ThicknessGrid({ handleClick }) {
    const static_server_url = useRecoilValue(staticServerAtom);
    const drawing = useRecoilValue(drawingAtom);
    const [image] = useImage(`${static_server_url}/registration/registration_map.png`, 'anonymous');


    const imageRef = useRef();

    if (!image) return null;

    return <KonvaImage
        ref={imageRef}
        image={image}
        width={drawing.surfaceWidth}
        height={drawing.surfaceHeight}
        onClick={handleClick}
    />
}


