import { Box } from '@mantine/core'
import React, { useEffect, useRef } from 'react'
import { Viewer } from './Viewer2D'

import HoverInfo from './HoverInfo'
import { Toolbar } from './Toolbar'
import { useRecoilState, useRecoilValue } from 'recoil'
import { AUT_DATA_ATOM, TOOLBAR_ATOM } from './atom'
import ErrorPage from './ErrorPage'
import Legends from './Legends'
import ViewerHeader from './ViewerDetails'

const App = () => {

    const [autData, setAutData] = useRecoilState(AUT_DATA_ATOM);
    const [toolbar, setToolbar] = useRecoilState(TOOLBAR_ATOM);

    // cache and offscreen canvas
    const imageCache = useRef(new Map());
    const canvasRef = useRef(document.createElement("canvas"));
    const ctxRef = useRef(canvasRef.current.getContext("2d"));

    // Generate heatmap (optimized)
    const generateHeatmap = (scan_id, nominal, matrix) => {
        if (!matrix || !matrix.length) return null;

        const width = matrix[0].length;
        const height = matrix.length;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;

        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        for (let y = 0; y < height; y++) {
            const row = matrix[y];
            for (let x = 0; x < width; x++) {
                const val = row[x];
                const i = (y * width + x) * 4;

                if (!val || val <= 0 || Number.isNaN(val)) {
                    data[i + 3] = 0;
                    continue;
                }

                let r = 0, g = 0, b = 0;
                if (val < 0.8 * nominal) { r = 204; g = 102; b = 0; }
                else if (val < 0.9 * nominal) { r = 255; g = 255; b = 0; }
                else { r = 0; g = 255; b = 0; }

                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // flip vertically
        const flippedCanvas = document.createElement("canvas");
        flippedCanvas.width = width;
        flippedCanvas.height = height;
        const flippedCtx = flippedCanvas.getContext("2d");
        flippedCtx.translate(0, height);
        flippedCtx.scale(1, -1);
        flippedCtx.drawImage(canvas, 0, 0);

        const image = new Image();
        image.src = flippedCanvas.toDataURL();
        imageCache.current.set(scan_id, image);
        return image;
    };

    // Fetch AUT data once
    const getAutData = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const autId = urlParams.get('aut');
        if (!autId) return;
        let max_thk_range = 0;
        const res = await api.get(`spa_assetm.api.aut_2d.get_aut_data?aut_id=${autId}`);
        if (res?.message) {
            const aut_ = res.message;
            aut_.scans.forEach((scan, i) => {
                if (!scan.x) scan.x = i * 100;
                if (!scan.y) scan.y = 0;
                if (!scan.width) scan.width = 100;
                if (!scan.height) scan.height = 1000;
                if (!scan.rotation) scan.rotation = 0;
                scan.image = generateHeatmap(scan.name, scan.nominal_thk || 10, scan.data.matrix);
                max_thk_range = Math.max(scan.max_thk, max_thk_range);
                // console.log(max_thk_range)
            });
            setAutData(aut_);
            setToolbar({
                ...toolbar, thk_filter: { ...toolbar['thk_filter'], max_range: max_thk_range, max: max_thk_range }
            })
        }
    };

    useEffect(() => { getAutData(); }, []);

    // Apply thickness filter dynamically
    useEffect(() => {
        if (!toolbar?.thk_filter?.run || !autData?.scans?.length) return;

        const { min, max } = toolbar.thk_filter;
        const filteredScans = autData.scans.map(scan => {
            if (!scan.data?.matrix) return scan;

            const filteredMatrix = scan.data.matrix.map(row =>
                row.map(el => ((el && el >= min && el <= max) ? el : 0))
            );
            // console.log(min, max, filteredMatrix)
            let image = generateHeatmap(scan.name, scan.nominal_thk || 10, filteredMatrix);

            return { ...scan, image };
        });
        setToolbar({
            ...toolbar, thk_filter: { ...toolbar['thk_filter'], min, max, run: false }
        })

        // Use requestIdleCallback for smoother updates
        requestIdleCallback(() => setAutData({ ...autData, scans: filteredScans }));
    }, [toolbar.thk_filter]);

    if (!autData) return <ErrorPage />;

    return (
        <Box style={{ height: "100vh", width: "100vw" }}>
            <ViewerHeader autData={autData} />
            <Viewer backgroundSrc={autData.drawing_2d} scans={autData.scans} />
            <HoverInfo />
            <Toolbar />
            <Legends />
        </Box>
    );
};

export default App;
