@echo off
title Jurislink - Automated Test Suite

echo ==============================================================================
echo                 JURISLINK (न्याय सेतु) - AUTOMATED TEST SUITE
echo ==============================================================================
echo.

call npm test

echo.
echo ==============================================================================
echo Testing complete. Press any key to close.
echo ==============================================================================
pause >nul
