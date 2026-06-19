import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export async function fillAndDownload(templateUrl, data, fileName) {
	const response = await fetch(templateUrl);
	if (!response.ok) {
		throw new Error(`Не удалось загрузить шаблон (${response.status})`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const zip = new PizZip(arrayBuffer);
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true,
	});

	doc.render(data);

	const blob = doc.toBlob({ type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${fileName}.docx`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
