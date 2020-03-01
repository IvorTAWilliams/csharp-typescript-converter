import * as React from 'react';
import {observer} from "mobx-react";
import {action, observable, runInAction} from "mobx";
import {ChangeEvent} from "react";

@observer
export default class Home extends React.Component {
	
	@observable
	private outputCode: string | undefined = undefined;
	
	@observable
	private inputCode: string = '';
	
	private lastKeyPressed: number | undefined = undefined; 
	
	private typeMappings = {
		'Int': 'number',
		'int': 'number',
		'int?': 'number | undefined',
		'decimal': 'number',
		'Decimal': 'number',
		'decimal?': 'number | undefined',
		'string': 'string',
		'String': 'string',
		'bool': 'boolean',
		'Boolean': 'boolean',
		'DateTime': 'Date',
		'Guid': 'string'
	};
	
	@action
	private onInput = (changeEvent: ChangeEvent<HTMLTextAreaElement>) => {
		let value = changeEvent.target.value.slice(-1);
		if (value == '{' && this.lastKeyPressed != 8) {
			this.inputCode = changeEvent.target.value.slice(0, -1) + '{';
		} else {
			this.inputCode = changeEvent.target.value;
		}
		this.convert();
	};

	@action
	private onKeyPress = (event: any) => {
		if (event.keyCode == 9) {
			this.inputCode = this.inputCode + '\t';
			event.preventDefault();
		}
		console.log(event.keyCode)
		this.lastKeyPressed = event.keyCode;
	};
	
	@action
	private convert = () => {
		const lines = this.inputCode.split('\n');
		let output: string[] = [];
		lines.map(line => {
			line = line.replace('\t', '');
			let words = line.split(' ');
			let filteredWords: string[] = [];
			words.map(word => {
				if(word != ''){
					filteredWords.push(word.trim())
				}
			});
			words = filteredWords;
			if(words[0] && words[0][0] && words[0][0] == '/' && words[0][1] && words[0][1] == '/' && words[1] && !words[1].includes('summary')) {
				output.push(`\t// ${words.slice(1).reduce((total, currentWord) => {return total + ' ' + currentWord})}\n`)
			} else if(words[0] == 'public' && words[1] && words[1] == 'class' && words[2]) {
				output.push(`export interface ${words[2]} {\n`)
			}else if (words[0] == 'public'){
				const type = this.getTypescriptType(words[1] ? words[1] : '');
				const name = words[2] ? words[2] : '';
				if (name[0]) {
					output.push(`\t${name[0].toLowerCase() + name.slice(1)}: ${type};\n`)
				}
			}
		});
		let outputString = '';
		output.map(line => {outputString = outputString + line});
		if (outputString.includes('export')) {
			outputString = outputString + '}'
		}
		this.outputCode = outputString
	};
	
	private getTypescriptType = (csharpType: string) : string => {
		// @ts-ignore
		if (this.typeMappings[csharpType]) {
			// @ts-ignore
			return this.typeMappings[csharpType];
		}else if (csharpType.includes('<')) {
			const subwords = csharpType
				.replace('<', ' ')
				.replace('>', ' ')
				.split(' ');
			return `Array<${this.getTypescriptType(subwords[1])}>`;
		}
		return csharpType;
	};
	
	public render() {
		return (
			<div className={'home'}>
				<h1>C# => Typescript Converter</h1>
				<div className={'code-area-group'}>
					<textarea spellCheck={false} className={'input-code-area code-area'} onChange={this.onInput} onKeyDown={this.onKeyPress} value={this.inputCode}/>
					<textarea spellCheck={false} className={'output-code-area code-area'} onChange={this.onInput} value={this.outputCode}/>
				</div>
			</div>
		);
	}
}