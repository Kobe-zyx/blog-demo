const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const FileManager = require('../utils/FileManager');

const fileManager = new FileManager();

/**
 * 获取所有草稿列表
 * GET /api/drafts
 */
router.get('/', async (req, res) => {
    try {
        const drafts = await fileManager.listDrafts();
        
        res.json({
            success: true,
            drafts,
            message: '草稿列表获取成功'
        });
    } catch (error) {
        console.error('获取草稿列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取草稿列表失败',
            message: error.message
        });
    }
});

/**
 * 获取单个草稿
 * GET /api/drafts/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const draftData = await fileManager.loadDraft(id);
        if (!draftData) {
            return res.status(404).json({
                success: false,
                error: '草稿未找到'
            });
        }

        const draft = Draft.fromJSON(draftData);
        
        res.json({
            success: true,
            draft: draft.toJSON(),
            message: '草稿获取成功'
        });
    } catch (error) {
        console.error('获取草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '获取草稿失败',
            message: error.message
        });
    }
});

/**
 * 保存草稿
 * POST /api/drafts
 */
router.post('/', async (req, res) => {
    try {
        const { id, title, content, autoSave = true } = req.body;

        // 创建或更新草稿
        let draft;
        if (id) {
            // 更新现有草稿
            const existingData = await fileManager.loadDraft(id);
            if (existingData) {
                draft = Draft.fromJSON(existingData);
                draft.update(title, content);
            } else {
                draft = new Draft({ id, title, content, autoSave });
            }
        } else {
            // 创建新草稿
            draft = new Draft({ title, content, autoSave });
        }

        // 验证草稿数据
        const validation = draft.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: '数据验证失败',
                details: validation.errors
            });
        }

        // 保存草稿
        await fileManager.saveDraft(draft.id, draft.toJSON());

        res.json({
            success: true,
            draft: draft.toJSON(),
            message: '草稿保存成功'
        });

    } catch (error) {
        console.error('保存草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '保存草稿失败',
            message: error.message
        });
    }
});

/**
 * 更新草稿
 * PUT /api/drafts/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // 加载现有草稿
        const existingData = await fileManager.loadDraft(id);
        if (!existingData) {
            return res.status(404).json({
                success: false,
                error: '草稿未找到'
            });
        }

        // 更新草稿
        const draft = Draft.fromJSON(existingData);
        draft.update(title, content);

        // 验证数据
        const validation = draft.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: '数据验证失败',
                details: validation.errors
            });
        }

        // 保存更新
        await fileManager.saveDraft(draft.id, draft.toJSON());

        res.json({
            success: true,
            draft: draft.toJSON(),
            message: '草稿更新成功'
        });

    } catch (error) {
        console.error('更新草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '更新草稿失败',
            message: error.message
        });
    }
});

/**
 * 删除草稿
 * DELETE /api/drafts/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await fileManager.deleteDraft(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: '草稿未找到'
            });
        }

        res.json({
            success: true,
            message: '草稿删除成功'
        });

    } catch (error) {
        console.error('删除草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '删除草稿失败',
            message: error.message
        });
    }
});

module.exports = router;