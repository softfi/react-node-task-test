const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        const { agenda, related, location, dateTime, notes } = req.body;

        // Validate required fields
        if (!agenda || !related || !dateTime ) {
            return res.status(400).json({
                success: false,
                message: 'Agenda, Related, Date Time, and Created By are required.'
            });
        }

        const meeting = new MeetingHistory({
            agenda,
            related,
            location,
            dateTime,
            notes,
            createBy:req.user.userId
        });

        await meeting.save();
        return res.status(201).json({
            success: true,
            message: 'Meeting added successfully',
            data: meeting
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding meeting',
            error: error.message
        });
    }
}

const index = async (req, res) => {
    try {
        const meetings = await MeetingHistory.find({ deleted: false })
        .populate("createBy", "firstName lastName email") // Populate only createBy field
        // .populate([
        //     // {
        //     //     path: 'attendes',
        //     //     match: { deleted: false }
        //     // },
        //     // {
        //     //     path: 'attendesLead',
        //     //     match: { deleted: false }
        //     // },
        //     {
        //         path: 'createBy',
        //         match: { deleted: false }
        //     }
        // ]); 

        return res.status(200).json({
            success: true,
            data: meetings
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching meetings',
            error: error.message
        });
    }
}

const view = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const meeting = await MeetingHistory.findById(meetingId);
        if (!meeting || meeting.deleted) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: meeting
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching meeting',
            error: error.message
        });
    }
}

const deleteData = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const meeting = await MeetingHistory.findById(meetingId);
        if (!meeting || meeting.deleted) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }
        meeting.deleted = true;
        await meeting.save();
        return res.status(200).json({
            success: true,
            message: 'Meeting deleted successfully'
        });    
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting meeting',
            error: error.message
        });
    }
}

const deleteMany = async (req, res) => {
    try {
        const ids  = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or empty IDs array'
            });
        }

        const result = await MeetingHistory.updateMany(
            { _id: { $in: ids }, deleted: false },
            { $set: { deleted: true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No meetings found to delete'
            });
        }

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} meetings deleted successfully`
        });
    } catch (error) {
        console
        return res.status(500).json({
            success: false,
            message: 'Error deleting meetings',
            error: error.message
        });
    }
}

module.exports = { add, index, view, deleteData, deleteMany }