import fs from 'fs';
import archiver from 'archiver';

export const generateZipFile = async (docToBeZippedLoc: string, zipFilePath: string, fileNameOnZip = 'file.txt') => {
  const docStats = await fs.statSync(docToBeZippedLoc);

  return new Promise((resolve, reject) => {
    // Create a writable stream for the zip file
    const output = fs.createWriteStream(zipFilePath);

    // Create a new archive instance
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Set compression level (0-9)
    });

    // Pipe the archive data to the output stream
    archive.pipe(output);

    if (docStats.isDirectory()) {
      // Append files from a sub-directory, putting its contents at the root of archive
      archive.directory(docToBeZippedLoc, false);
    } else {
      // Append file to zip file on root
      archive.file(docToBeZippedLoc, { name: fileNameOnZip });
    }

    // Finalize the archive (this will create the zip file)
    archive.finalize();

    // Listen for all archive data to be written
    output.on('close', () => {
      return resolve(zipFilePath);
    });

    // Listen for errors during the archiving process
    archive.on('error', (err) => {
      return reject(err);
    });
  });
};
