import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

/**
 * 文件写入测试 API
 * 
 * 该 API 用于测试文件写入功能，可以将文本内容保存为文件。
 * 
 * 请求参数:
 * - text: 要保存的文本内容 (必填)
 * - filename: 文件名 (必填)
 * - format: 文件格式 (可选，默认为 'txt')
 * 
 * 响应格式:
 * - success: 是否成功
 * - filePath: 保存的文件路径
 * 
 * 错误响应:
 * - error: 错误消息
 * - details: 详细错误信息
 */

// 确保目录存在
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fsPromises.access(dirPath);
  } catch (error) {
    // 目录不存在，创建它
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, filename, format = 'txt' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    // 创建保存目录
    const saveDir = path.join(process.cwd(), 'public', 'saved_files');
    await ensureDirectoryExists(saveDir);

    // 构建文件名，确保安全
    const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fullFilename = `${safeFilename}.${format}`;
    const filePath = path.join(saveDir, fullFilename);

    // 写入文件
    await fsPromises.writeFile(filePath, text, 'utf8');

    // 返回公共URL路径
    const publicPath = `/saved_files/${fullFilename}`;

    return NextResponse.json({
      success: true,
      filePath: publicPath
    });
  } catch (error) {
    console.error('File write API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to write file', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 